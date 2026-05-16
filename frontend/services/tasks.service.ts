import type { Task, TaskCreatePayload, TaskUpdatePayload } from "@/types/task";
import { api } from "./api";

export const tasksService = {
  async list(): Promise<Task[]> {
    const { data } = await api.get<Task[]>("/api/tasks");
    return data;
  },

  async create(payload: TaskCreatePayload): Promise<Task> {
    const { data } = await api.post<Task>("/api/tasks", payload);
    return data;
  },

  async update(taskId: number, payload: TaskUpdatePayload): Promise<Task> {
    const { data } = await api.patch<Task>(`/api/tasks/${taskId}`, payload);
    return data;
  },

  async remove(taskId: number): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
  },
};
