"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import {
  GreetingHeader,
  StreakCard,
  DailiesCard,
  OverdueCard,
} from "@/app/components";
import { DashboardSkeleton } from "./components/dashboard-skeleton";
import { QuickTasksCard } from "@/app/components/quick-tasks-card";

import type { DailyListResult } from "@/lib/services/daily.service";
import type { StreakResult } from "@/lib/services/streak.service";
import type { OverdueTask } from "@/lib/services/task.service";
import type { TodayTasksResult } from "@/lib/services/today.service";

import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface DashboardData {
  daily: DailyListResult | null;
  streak: StreakResult;
  overdue: OverdueTask[];
  today: TodayTasksResult;
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
      const [dailyRes, streakRes, overdueRes, todayRes] = await Promise.all([
        fetch(`/api/daily?date=${dateParam}`),
        fetch("/api/daily/streak"),
        fetch("/api/tasks/overdue"),
        fetch(`/api/tasks/today?date=${dateParam}`),
      ]);

      const failed = [
        !dailyRes.ok && "daily list",
        !streakRes.ok && "streak",
        !overdueRes.ok && "overdue tasks",
        !todayRes.ok && "quick tasks",
      ].filter(Boolean);

      if (failed.length > 0) {
        throw new Error(`Failed to load: ${failed.join(", ")}`);
      }

      const [daily, streak, overdue, todayTasks] = await Promise.all([
        dailyRes.json(),
        streakRes.json(),
        overdueRes.json(),
        todayRes.json(),
      ]);

      setData({ daily, streak, overdue, today: todayTasks });
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
  
  const refreshStreaks = async () => {
    const res = await fetch("/api/daily/streak");
    const streakData = await res.json();
    setData((prev) => prev ? { ...prev, streak: streakData } : prev);
  };
  
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

  const { daily, streak, overdue, today } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-2">
      <GreetingHeader />

      <button className="flex ml-auto gap-1 text-xs text-mono-400 hover:text-mono-200 transition-opacity cursor-pointer" onClick={fetchDashboard}>
        <ArrowPathIcon className="h-4 w-4" /> sync
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <StreakCard
            globalStreak={streak.globalStreak}
            todayCompleted={streak.todayCompleted}
            todayTotal={streak.todayTotal}
            perHabit={streak.perHabit}
          />
          <OverdueCard tasks={overdue} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {daily ? (
            <DailiesCard
              dailyId={daily._id}
              tasks={daily.tasks}
              completedCount={daily.completedCount}
              totalCount={daily.totalCount}
              onHabitToggle={refreshStreaks}
            />
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <p className="text-xs font-medium uppercase text-zinc-400 dark:text-zinc-500 mb-4">
                Today&#39;s dailies
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

          <QuickTasksCard
            listId={today.listId}
            initialTasks={today.tasks}
          />
        </div>
      </div>
    </div>
  );
}