"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function MainLayout({ children }: { children: ReactNode }) {
  const { initialized, user } = useAuth();
  useRequireAuth();

  if (!initialized || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
