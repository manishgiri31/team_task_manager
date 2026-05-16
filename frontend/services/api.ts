import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { clearSessionCookie } from "@/lib/session-cookie";
import { tokenStorage } from "@/lib/token-storage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("API_BASE_URL:", API_BASE_URL);
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      tokenStorage.remove();
      clearSessionCookie();
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/signup")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string | { msg?: string }[]; message?: string }
      | undefined;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((d) => {
          if (typeof d === "string") return d;
          if (typeof d === "object" && d && "msg" in d) return String((d as { msg: unknown }).msg);
          return "";
        })
        .filter(Boolean)
        .join(", ");
    }
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
