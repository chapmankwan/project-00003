import "@/models";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { getDailyForDate } from "@/lib/services/daily.service";
import { getStreakData } from "@/lib/services/streak.service";
import { getOverdueTasks } from "@/lib/services/task.service";

import {
    GreetingHeader,
    StreakCard,
    DailiesCard,
    OverdueCard,
} from "@/app/components";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const today = new Date();

  const [daily, streak, overdue] = await Promise.all([
    getDailyForDate(userId, today),
    getStreakData(userId),
    getOverdueTasks(userId),
  ]);

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