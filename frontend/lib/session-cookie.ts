import { SESSION_COOKIE_NAME } from "./session-constants";

const ONE_WEEK = 60 * 60 * 24 * 7;

/**
 * Lightweight session flag for Next.js middleware (Edge cannot read localStorage).
 * The real credential is the JWT in localStorage, sent as Authorization on API calls.
 */
export function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${ONE_WEEK}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
}
