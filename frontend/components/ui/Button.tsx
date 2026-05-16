"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50",
  secondary:
    "bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 disabled:opacity-50",
  ghost: "text-slate-300 hover:bg-slate-800/80 disabled:opacity-50",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 shadow-sm",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
