"use client";

import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const border =
          t.variant === "success"
            ? "border-emerald-500/40 bg-emerald-950/90"
            : t.variant === "error"
              ? "border-rose-500/40 bg-rose-950/90"
              : "border-slate-600 bg-slate-900/95";
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur ${border}`}
          >
            <p className="flex-1 text-sm text-slate-100">{t.message}</p>
            <Button
              variant="ghost"
              type="button"
              className="shrink-0 px-2 py-1 text-xs"
              onClick={() => dismissToast(t.id)}
            >
              Dismiss
            </Button>
          </div>
        );
      })}
    </div>
  );
}
