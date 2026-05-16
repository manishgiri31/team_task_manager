"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UserSelect } from "@/components/UserSelect";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { projectsService } from "@/services/projects.service";
import { tasksService } from "@/services/tasks.service";
import { usersService } from "@/services/users.service";
import type { ProjectDetail } from "@/types/project";
import type { Task } from "@/types/task";
import type { UserSummary } from "@/types/user";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberModal, setMemberModal] = useState(false);
  const [memberUserId, setMemberUserId] = useState<number | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [usersById, setUsersById] = useState<Record<number, UserSummary>>({});

  const load = useCallback(async () => {
    if (!Number.isFinite(projectId)) return;
    setLoading(true);
    try {
      const [p, allTasks] = await Promise.all([
        projectsService.getById(projectId),
        tasksService.list(),
      ]);
      setProject(p);
      setTasks(allTasks.filter((t) => t.project_id === projectId));
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin || !Number.isFinite(projectId)) {
      setUsersById({});
      return;
    }
    let cancelled = false;
    usersService
      .list({ limit: 500 })
      .then((list) => {
        if (!cancelled) {
          setUsersById(Object.fromEntries(list.map((u) => [u.id, u])));
        }
      })
      .catch(() => {
        if (!cancelled) setUsersById({});
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, projectId]);

  async function addMember() {
    if (memberUserId == null || !Number.isFinite(memberUserId)) {
      showToast("Select a user to add", "error");
      return;
    }
    setSavingMember(true);
    try {
      await projectsService.addMember(projectId, { user_id: memberUserId });
      showToast("Member added", "success");
      setMemberModal(false);
      setMemberUserId(null);
      await load();
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setSavingMember(false);
    }
  }

  if (!Number.isFinite(projectId)) {
    return <p className="text-slate-400">Invalid project.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <PageHeader title="Project" description="Not found or no access." />
        <Link href="/projects" className="text-indigo-400 hover:text-indigo-300">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Projects
        </Link>
      </div>
      <PageHeader
        title={project.title}
        description={project.description ?? "No description provided."}
        actions={
          isAdmin ? (
            <Button
              type="button"
              onClick={() => {
                setMemberUserId(null);
                setMemberModal(true);
              }}
            >
              Add member
            </Button>
          ) : null
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-400">Members</p>
          <p className="mt-1 text-2xl font-semibold text-white">{project.members_count}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Tasks</p>
          <p className="mt-1 text-2xl font-semibold text-white">{project.tasks_count}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Created</p>
          <p className="mt-1 text-lg text-slate-200">{formatDate(project.created_at)}</p>
        </Card>
      </div>

      <Card className="mb-10">
        <h2 className="text-lg font-semibold text-white">Members</h2>
        <p className="mt-1 text-sm text-slate-500">
          Project member directory{isAdmin ? " (names load for admins)" : ""}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.members.length === 0 ? (
            <span className="text-sm text-slate-500">No members yet.</span>
          ) : (
            project.members.map((id) => {
              const u = usersById[id];
              const label = u ? `${u.name} · ${u.email}` : `User #${id}`;
              return (
                <span
                  key={id}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
                  title={u?.email ?? `User id ${id}`}
                >
                  {label}
                </span>
              );
            })
          )}
        </div>
      </Card>

      <h2 className="mb-4 text-lg font-semibold text-white">Tasks in this project</h2>
      {tasks.length === 0 ? (
        <Card className="text-center text-sm text-slate-500">No tasks for this project yet.</Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-slate-100">{t.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(t.due_date)}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {t.assigned_to != null ? `#${t.assigned_to}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={memberModal}
        title="Add project member"
        onClose={() => {
          setMemberModal(false);
          setMemberUserId(null);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setMemberModal(false);
                setMemberUserId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savingMember}
              onClick={addMember}
            >
              {savingMember ? "Adding…" : "Add member"}
            </Button>
          </>
        }
      >
        <UserSelect
          fieldId="add-project-member"
          label="User"
          value={memberUserId}
          onChange={setMemberUserId}
          disabled={savingMember}
          excludeUserIds={project.members}
          placeholder="Search name or email…"
        />
      </Modal>
    </div>
  );
}
