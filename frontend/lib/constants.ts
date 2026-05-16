import { SESSION_COOKIE_NAME, TOKEN_STORAGE_KEY } from "./session-constants";

/** Public API origin (inlined at build time from NEXT_PUBLIC_API_URL). */
function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
);

export { SESSION_COOKIE_NAME, TOKEN_STORAGE_KEY };
