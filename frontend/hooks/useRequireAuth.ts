"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Ensures client state matches protected routes (e.g. after cookie/session mismatch).
 */
export function useRequireAuth() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      logout();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        router.replace("/login");
      }
    }
  }, [user, initialized, logout, router]);

  return { user, initialized: initialized && !!user };
}
