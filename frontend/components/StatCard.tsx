export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent: "indigo" | "emerald" | "amber" | "rose";
}) {
  const ring: Record<typeof accent, string> = {
    indigo: "from-indigo-500/30 to-indigo-600/5",
    emerald: "from-emerald-500/30 to-emerald-600/5",
    amber: "from-amber-500/30 to-amber-600/5",
    rose: "from-rose-500/30 to-rose-600/5",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br ${ring[accent]} p-5`}
    >
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
