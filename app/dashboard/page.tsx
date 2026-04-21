"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import {
  GreetingHeader,
  StreakCard,
  DailiesCard,
  OverdueCard,
} from "@/app/components";
import { DashboardSkeleton } from "@/app/dashboard/components/dashboard-skeleton";

import type { DailyListResult } from "@/lib/services/daily.service";
import type { StreakResult } from "@/lib/services/streak.service";
import type { OverdueTask } from "@/lib/services/task.service";

interface DashboardData {
  daily: DailyListResult | null;
  streak: StreakResult;
  overdue: OverdueTask[];
}

function toLocalDateParam(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    const today = new Date();
    const dateParam = toLocalDateParam(today);

    try {
      const [dailyRes, streakRes, overdueRes] = await Promise.all([
        fetch(`/api/daily?date=${dateParam}`),
        fetch("/api/daily/streak"),
        fetch("/api/tasks/overdue"),
      ]);

      const failed = [
        !dailyRes.ok && "daily list",
        !streakRes.ok && "streak",
        !overdueRes.ok && "overdue tasks",
      ].filter(Boolean);

      if (failed.length > 0) {
        throw new Error(`Failed to load: ${failed.join(", ")}`);
      }

      const [daily, streak, overdue] = await Promise.all([
        dailyRes.json(),
        streakRes.json(),
        overdueRes.json(),
      ]);

      setData({ daily, streak, overdue });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard", {
        description: err instanceof Error ? err.message : "Something went wrong.",
        action: {
          label: "Retry",
          onClick: fetchDashboard,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <DashboardSkeleton />;

  // Data failed and toast is shown — render minimal shell so retry is clear
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
        <GreetingHeader />
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Could not load dashboard.{" "}
          <button
            onClick={fetchDashboard}
            className="underline underline-offset-2 text-zinc-600 dark:text-zinc-300"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  const { daily, streak, overdue } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <GreetingHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <StreakCard
            globalStreak={streak.globalStreak}
            todayCompleted={streak.todayCompleted}
            todayTotal={streak.todayTotal}
            perHabit={streak.perHabit}
          />
          <OverdueCard tasks={overdue} />
        </div>

        <div className="flex flex-col gap-4">
          {daily ? (
            <DailiesCard
              dailyId={daily._id}
              tasks={daily.tasks}
              completedCount={daily.completedCount}
              totalCount={daily.totalCount}
            />
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
                Todays dailies
              </p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No daily list for today yet.{" "}
                <a
                  href="/daily"
                  className="text-zinc-600 dark:text-zinc-300 underline underline-offset-2"
                >
                  Visit dailies
                </a>{" "}
                to generate it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}