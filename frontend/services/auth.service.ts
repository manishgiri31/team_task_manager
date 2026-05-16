import type { TokenResponse, User, UserLoginPayload, UserSignupPayload } from "@/types/user";
import { api } from "./api";

export const authService = {
  async login(payload: UserLoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>("/api/auth/login", payload);
    return data;
  },

  async signup(payload: UserSignupPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>("/api/auth/signup", payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/api/auth/me");
    return data;
  },
};
