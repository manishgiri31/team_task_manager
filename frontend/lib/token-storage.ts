import { TOKEN_STORAGE_KEY } from "./session-constants";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  remove(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
