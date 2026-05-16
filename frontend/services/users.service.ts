import type { UserSummary } from "@/types/user";
import { api } from "./api";

export interface ListUsersParams {
  q?: string;
  limit?: number;
}

export const usersService = {
  async list(params?: ListUsersParams): Promise<UserSummary[]> {
    const { data } = await api.get<UserSummary[]>("/api/users", {
      params: {
        q: params?.q?.trim() || undefined,
        limit: params?.limit ?? undefined,
      },
    });
    return data;
  },
};
