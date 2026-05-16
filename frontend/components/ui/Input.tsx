import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
}
