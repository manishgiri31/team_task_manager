import type { LabelHTMLAttributes, ReactNode } from "react";

export function FieldLabel({
  children,
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
