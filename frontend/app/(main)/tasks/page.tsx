"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserSelect } from "@/components/UserSelect";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import { formatDate } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { projectsService } from "@/services/projects.service";
import { tasksService } from "@/services/tasks.service";
import { usersService } from "@/services/users.service";
import type { Project } from "@/types/project";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import type { UserSummary } from "@/types/user";

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPriority, setCPriority] = useState<TaskPriority>("medium");
  const [cDue, setCDue] = useState("");
  const [cProjectId, setCProjectId] = useState("");
  const [cAssignUserId, setCAssignUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [eTitle, setETitle] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [eStatus, setEStatus] = useState<TaskStatus>("todo");
  const [ePriority, setEPriority] = useState<TaskPriority>("medium");
  const [eDue, setEDue] = useState("");
  const [eAssignUserId, setEAssignUserId] = useState<number | null>(null);

  const [assigneesById, setAssigneesById] = useState<Record<number, UserSummary>>({});

  const projectTitle = useMemo(() => {
    const map: Record<number, string> = {};
    projects.forEach((p) => {
      map[p.id] = p.title;
    });
    return map;
  }, [projects]);

  useEffect(() => {
    if (!isAdmin) {
      setAssigneesById({});
      return;
    }
    let cancelled = false;
    usersService
      .list({ limit: 500 })
      .then((list) => {
        if (!cancelled) {
          setAssigneesById(Object.fromEntries(list.map((u) => [u.id, u])));
        }
      })
      .catch(() => {
        if (!cancelled) setAssigneesById({});
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const assigneeLabel = useCallback((id: number | null) => {
    if (id == null) return "—";
    const u = assigneesById[id];
    return u ? u.name : `#${id}`;
  }, [assigneesById]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([tasksService.list(), projectsService.list()]);
      setTasks(t);
      setProjects(p);
      setCProjectId((prev) => (prev ? prev : p[0] ? String(p[0].id) : ""));
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(task: Task) {
    setEditTask(task);
    setETitle(task.title);
    setEDesc(task.description ?? "");
    setEStatus(task.status);
    setEPriority(task.priority);
    setEDue(toDatetimeLocalValue(task.due_date));
    setEAssignUserId(task.assigned_to);
  }

  async function submitCreate() {
    if (!cTitle.trim()) {
      showToast("Title is required", "error");
      return;
    }
    const pid = Number(cProjectId);
    if (!Number.isFinite(pid)) {
      showToast("Select a project", "error");
      return;
    }
    setSaving(true);
    try {
      await tasksService.create({
        title: cTitle.trim(),
        description: cDesc.trim() || null,
        priority: cPriority,
        due_date: fromDatetimeLocalValue(cDue),
        project_id: pid,
        assigned_to: cAssignUserId,
      });
      showToast("Task created", "success");
      setCreateOpen(false);
      setCTitle("");
      setCDesc("");
      setCPriority("medium");
      setCDue("");
      setCAssignUserId(null);
      await load();
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit() {
    if (!editTask) return;
    setSaving(true);
    try {
      if (isAdmin) {
        await tasksService.update(editTask.id, {
          title: eTitle.trim(),
          description: eDesc.trim() || null,
          status: eStatus,
          priority: ePriority,
          due_date: fromDatetimeLocalValue(eDue),
          assigned_to: eAssignUserId,
        });
      } else {
        await tasksService.update(editTask.id, { status: eStatus });
      }
      showToast("Task updated", "success");
      setEditTask(null);
      await load();
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatusQuick(task: Task, status: TaskStatus) {
    try {
      await tasksService.update(task.id, { status });
      showToast("Status updated", "success");
      await load();
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    }
  }

  async function removeTask(id: number) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await tasksService.remove(id);
      showToast("Task deleted", "success");
      await load();
    } catch (e) {
      showToast(getApiErrorMessage(e), "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Create, assign, and track work. Members may only change status on tasks assigned to them."
        actions={
          isAdmin ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              New task
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks"
          description={
            isAdmin
              ? "Create a task and link it to a project."
              : "You will see tasks assigned to you here."
          }
          action={
            isAdmin ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Create task
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-800 lg:block">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-100">{t.title}</p>
                      {t.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{t.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${t.project_id}`}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        {projectTitle[t.project_id] ?? `Project #${t.project_id}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin || t.assigned_to === user?.id ? (
                        <Select
                          aria-label="Status"
                          value={t.status}
                          onChange={(e) =>
                            updateStatusQuick(t, e.target.value as TaskStatus)
                          }
                          className="max-w-[140px] py-1.5 text-xs"
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </Select>
                      ) : (
                        <StatusBadge status={t.status} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(t.due_date)}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {assigneeLabel(t.assigned_to)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            type="button"
                            className="px-2 py-1 text-xs"
                            onClick={() => openEdit(t)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            type="button"
                            className="px-2 py-1 text-xs"
                            onClick={() => removeTask(t.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : t.assigned_to === user?.id ? (
                        <Button
                          variant="ghost"
                          type="button"
                          className="px-2 py-1 text-xs"
                          onClick={() => openEdit(t)}
                        >
                          Update status
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {tasks.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{t.title}</p>
                    <Link
                      href={`/projects/${t.project_id}`}
                      className="mt-1 inline-block text-xs text-indigo-400"
                    >
                      {projectTitle[t.project_id] ?? `Project #${t.project_id}`}
                    </Link>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
                {t.description ? (
                  <p className="mt-2 text-sm text-slate-400">{t.description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isAdmin || t.assigned_to === user?.id ? (
                    <Select
                      aria-label="Status"
                      value={t.status}
                      onChange={(e) =>
                        updateStatusQuick(t, e.target.value as TaskStatus)
                      }
                      className="max-w-[160px] flex-1 py-1.5 text-xs"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </Select>
                  ) : (
                    <StatusBadge status={t.status} />
                  )}
                  <span className="text-xs text-slate-500">
                    Due {formatDate(t.due_date)}
                  </span>
                  <span className="text-xs text-slate-500">
                    · {assigneeLabel(t.assigned_to)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {isAdmin ? (
                    <>
                      <Button
                        variant="secondary"
                        type="button"
                        className="flex-1 text-xs"
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        type="button"
                        className="flex-1 text-xs"
                        onClick={() => removeTask(t.id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : t.assigned_to === user?.id ? (
                    <Button
                      variant="secondary"
                      type="button"
                      className="w-full text-xs"
                      onClick={() => openEdit(t)}
                    >
                      Update status
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal
        open={createOpen}
        title="New task"
        onClose={() => {
          setCreateOpen(false);
          setCAssignUserId(null);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setCreateOpen(false);
                setCAssignUserId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={submitCreate}>
              {saving ? "Saving…" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <FieldLabel>Title</FieldLabel>
            <Input value={cTitle} onChange={(e) => setCTitle(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Project</FieldLabel>
            <Select value={cProjectId} onChange={(e) => setCProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
            {projects.length === 0 ? (
              <p className="mt-1 text-xs text-amber-400">Create a project first.</p>
            ) : null}
          </div>
          <div>
            <FieldLabel>Priority</FieldLabel>
            <Select
              value={cPriority}
              onChange={(e) => setCPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div>
            <FieldLabel>Due date</FieldLabel>
            <Input
              type="datetime-local"
              value={cDue}
              onChange={(e) => setCDue(e.target.value)}
            />
          </div>
          <div>
            <UserSelect
              fieldId="task-create-assignee"
              label="Assign to (optional)"
              value={cAssignUserId}
              onChange={setCAssignUserId}
              disabled={saving}
              placeholder="Search user by name or email…"
            />
            <p className="mt-1 text-xs text-slate-500">
              Assignee must be a member of the selected project (the API will validate).
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editTask}
        title={isAdmin ? "Edit task" : "Update task status"}
        onClose={() => setEditTask(null)}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditTask(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={submitEdit}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        {editTask && isAdmin ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Title</FieldLabel>
              <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <Textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={eStatus}
                onChange={(e) => setEStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Priority</FieldLabel>
              <Select
                value={ePriority}
                onChange={(e) => setEPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Due date</FieldLabel>
              <Input
                type="datetime-local"
                value={eDue}
                onChange={(e) => setEDue(e.target.value)}
              />
            </div>
            <div>
              <UserSelect
                fieldId="task-edit-assignee"
                label="Assignee"
                value={eAssignUserId}
                onChange={setEAssignUserId}
                disabled={saving}
                placeholder="Search user…"
              />
            </div>
          </div>
        ) : editTask ? (
          <div>
            <p className="mb-4 text-sm text-slate-400">{editTask.title}</p>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={eStatus}
              onChange={(e) => setEStatus(e.target.value as TaskStatus)}
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
