"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { getApiErrorMessage } from "@/services/api";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types/dashboard";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (silent: boolean) => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (e) {
        const msg = getApiErrorMessage(e);
        setStats(null);
        setLoadError(msg);
        if (!silent) showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void fetchStats(false);
  }, [fetchStats]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of tasks based on your role. Admins see all tasks; members see assigned work."
      />
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total tasks" value={stats.total_tasks} accent="indigo" />
          <StatCard
            label="Completed"
            value={stats.completed_tasks}
            accent="emerald"
            hint="Status: done"
          />
          <StatCard
            label="Pending"
            value={stats.pending_tasks}
            accent="amber"
            hint="Todo + in progress"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue_tasks}
            accent="rose"
            hint="Past due & not completed"
          />
        </div>
      ) : (
        <Card className="border-rose-900/40 bg-rose-950/20 p-6">
          <p className="text-sm font-medium text-rose-200">Could not load dashboard statistics</p>
          {loadError ? (
            <p className="mt-2 text-sm text-rose-300/90" role="status">
              {loadError}
            </p>
          ) : null}
          <Button type="button" className="mt-4" variant="secondary" onClick={() => void fetchStats(true)}>
            Try again
          </Button>
        </Card>
      )}
    </div>
  );
}
