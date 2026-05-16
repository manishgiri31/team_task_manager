import type { DashboardStats } from "@/types/dashboard";
import { api } from "./api";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>("/api/dashboard/stats");
    return data;
  },
};
