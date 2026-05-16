import type {
  Project,
  ProjectCreatePayload,
  ProjectDetail,
  ProjectMember,
  ProjectMemberCreatePayload,
} from "@/types/project";
import { api } from "./api";

export const projectsService = {
  async list(): Promise<Project[]> {
    const { data } = await api.get<Project[]>("/api/projects");
    return data;
  },

  async getById(projectId: number): Promise<ProjectDetail> {
    const { data } = await api.get<ProjectDetail>(`/api/projects/${projectId}`);
    return data;
  },

  async create(payload: ProjectCreatePayload): Promise<Project> {
    const { data } = await api.post<Project>("/api/projects", payload);
    return data;
  },

  async addMember(
    projectId: number,
    payload: ProjectMemberCreatePayload
  ): Promise<ProjectMember> {
    const { data } = await api.post<ProjectMember>(
      `/api/projects/${projectId}/members`,
      payload
    );
    return data;
  },
};
