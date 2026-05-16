import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/20 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
