"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastViewport } from "@/components/ToastViewport";
import type { ReactNode } from "react";

function ToastLayer({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastLayer>{children}</ToastLayer>
      </ToastProvider>
    </AuthProvider>
  );
}
