"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth.service";
import { clearSessionCookie, setSessionCookie } from "@/lib/session-cookie";
import { tokenStorage } from "@/lib/token-storage";
import type { User, UserLoginPayload, UserSignupPayload } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initialized: boolean;
  login: (payload: UserLoginPayload) => Promise<void>;
  signup: (payload: UserSignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const applySession = useCallback((accessToken: string, nextUser: User) => {
    tokenStorage.set(accessToken);
    setSessionCookie();
    setToken(accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.remove();
    clearSessionCookie();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = tokenStorage.get();
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const profile = await authService.me();
      setUser(profile);
      setToken(t);
    } catch {
      tokenStorage.remove();
      clearSessionCookie();
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = tokenStorage.get();
      if (!stored) {
        if (!cancelled) {
          setInitialized(true);
        }
        return;
      }
      setSessionCookie();
      try {
        const profile = await authService.me();
        if (!cancelled) {
          setUser(profile);
          setToken(stored);
        }
      } catch {
        if (!cancelled) {
          tokenStorage.remove();
          clearSessionCookie();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setInitialized(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload: UserLoginPayload) => {
      const data = await authService.login(payload);
      applySession(data.access_token, data.user);
    },
    [applySession]
  );

  const signup = useCallback(
    async (payload: UserSignupPayload) => {
      const data = await authService.signup(payload);
      applySession(data.access_token, data.user);
    },
    [applySession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initialized,
      login,
      signup,
      logout,
      refreshUser,
      isAdmin: user?.role === "admin",
    }),
    [user, token, initialized, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
