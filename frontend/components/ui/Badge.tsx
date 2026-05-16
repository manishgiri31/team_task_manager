import type { TaskPriority, TaskStatus } from "@/types/task";

const styles: Record<string, string> = {
  todo: "bg-slate-700 text-slate-200",
  in_progress: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40",
  done: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40",
  low: "bg-slate-700 text-slate-300",
  medium: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30",
  high: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const label =
    status === "in_progress"
      ? "In progress"
      : status === "todo"
        ? "Todo"
        : "Done";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
