"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader, Loader } from "@/app/components";

interface DateTaskCount {
  date: string;
  count: number;
}

interface QuickTaskResponse {
  _id: string;
  text: string;
  completed: boolean;
  dateCompleted: string | null;
  dueDate: string | null;
  date: string | null;
  order: number;
  createdAt: string;
}

// Extracts YYYY-MM-DD in the VIEWER'S local timezone, not UTC.
function toLocalDateParam(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Parses a YYYY-MM-DD string as a LOCAL date (not UTC midnight),
// so display formatting doesn't shift by a day.
function parseLocalDateParam(dateParam: string): Date {
  const [yyyy, mm, dd] = dateParam.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export default function QuickTasksIndex() {
  const { status } = useSession();
  const [dateGroups, setDateGroups] = useState<DateTaskCount[]>([]);
  const [loading, setLoading] = useState(true);

  if (status === "unauthenticated") redirect("/");

  const fetchDateGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks/quick");
      if (!res.ok) return;

      const tasks = (await res.json()) as QuickTaskResponse[];
      if (!tasks || tasks.length === 0) {
        setDateGroups([]);
        return;
      }

      // Group tasks by LOCAL date, not UTC date.
      // Fall back to createdAt for legacy tasks that predate the `date` field.
      const tasksByDate = new Map<string, number>();
      tasks.forEach((task: QuickTaskResponse) => {
        const anchorDate = task.date
          ? new Date(task.date)
          : new Date(task.createdAt);
        const localDate = toLocalDateParam(anchorDate);
        tasksByDate.set(localDate, (tasksByDate.get(localDate) || 0) + 1);
      });

      // Convert to sorted array (newest first) — compare as local dates
      const groups = Array.from(tasksByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort(
          (a, b) =>
            parseLocalDateParam(b.date).getTime() -
            parseLocalDateParam(a.date).getTime()
        );

      setDateGroups(groups);
    } catch (err) {
      console.error("Error fetching quick tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDateGroups();
  }, [fetchDateGroups]);

  return (
    <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
      <PageHeader title="Quick Tasks" />

      {loading ? (
        <Loader />
      ) : dateGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-mono-400">No quick tasks yet</p>
          <Link
            href={`/dashboard`}
            className="px-4 py-2 bg-mint-500 hover:bg-mint-600 rounded text-white"
          >
            Create First Quick Task
          </Link>
        </div>
      ) : (
        <ul className="space-y-2 w-[90%] lg:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto touch-pan-y scrollbar-soft py-4">
          {dateGroups.map((group) => (
            <li key={group.date}>
              <Link
                href={`/collections/quick-tasks/${group.date}`}
                className="block bg-mono-700 hover:bg-mono-600 p-4 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {parseLocalDateParam(group.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-mono-400 bg-mono-600 px-3 py-1 rounded">
                    {group.count} task{group.count !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}