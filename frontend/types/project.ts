export interface Project {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  created_at: string;
  members_count: number;
  tasks_count: number;
}

export interface ProjectDetail extends Project {
  members: number[];
}

export interface ProjectCreatePayload {
  title: string;
  description?: string | null;
}

export interface ProjectMemberCreatePayload {
  user_id: number;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  created_at: string;
}
