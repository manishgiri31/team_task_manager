export type UserRole = "admin" | "member";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface UserSignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/** Admin directory row (`GET /api/users`) — id, name, email only */
export interface UserSummary {
  id: number;
  name: string;
  email: string;
}
