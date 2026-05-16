export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project_id: number;
  assigned_to: number | null;
  created_by: number;
  created_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  project_id: number;
  assigned_to?: number | null;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to?: number | null;
}
