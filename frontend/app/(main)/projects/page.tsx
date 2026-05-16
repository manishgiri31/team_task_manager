"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { projectsService } from "@/services/projects.service";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectsService.list();
      setProjects(data);
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function createProject() {
    setSaving(true);
    try {
      await projectsService.create({
        title: title.trim(),
        description: description.trim() || null,
      });
      showToast("Project created", "success");
      setModalOpen(false);
      setTitle("");
      setDescription("");
      await load();
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Browse projects you can access. Only admins can create projects."
        actions={
          isAdmin ? (
            <Button type="button" onClick={() => setModalOpen(true)}>
              New project
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            isAdmin
              ? "Create a project to start organizing tasks for your team."
              : "Ask an admin to add you to a project."
          }
          action={
            isAdmin ? (
              <Button type="button" onClick={() => setModalOpen(true)}>
                Create project
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="h-full transition hover:border-indigo-500/40 hover:bg-slate-900">
                <h2 className="text-lg font-semibold text-white">{p.title}</h2>
                {p.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{p.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No description</p>
                )}
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{p.tasks_count} tasks</span>
                  <span>{p.members_count} members</span>
                  <span>Updated {formatDate(p.created_at)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="New project"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving || !title.trim()} onClick={createProject}>
              {saving ? "Saving…" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="pt">Title</FieldLabel>
            <Input id="pt" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="pd">Description</FieldLabel>
            <Textarea id="pd" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
