import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
