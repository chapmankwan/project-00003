"use client";

import { useState } from "react";

interface DailyTask {
  _id: string;
  text: string;
  completed: boolean;
}

interface DailiesCardProps {
  dailyId: string;
  tasks: DailyTask[];
  completedCount: number;
  totalCount: number;
}

export const DailiesCard = ({
  dailyId,
  tasks: initialTasks,
  completedCount: initialCompleted,
  totalCount,
}: DailiesCardProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [completedCount, setCompletedCount] = useState(initialCompleted);

  async function toggleTask(habitId: string, current: boolean) {
    // Optimistic update
    setTasks(prev =>
      prev.map(t => (t._id === habitId ? { ...t, completed: !current } : t))
    );
    setCompletedCount(prev => (current ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`/api/daily/${dailyId}/habit/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });

      if (!res.ok) throw new Error("Failed to toggle");

      const data = await res.json();
      setCompletedCount(data.completedCount);
    } catch {
      // Revert on failure
      setTasks(prev =>
        prev.map(t => (t._id === habitId ? { ...t, completed: current } : t))
      );
      setCompletedCount(prev => (current ? prev + 1 : prev - 1));
    }
  }

  return (
    <div className="rounded-xl border border-mono-200 dark:border-mono-800 bg-white dark:bg-mono-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-mono-400 dark:text-mono-500">
          Today s dailies
        </p>
        <span className="text-xs text-mono-400 dark:text-mono-500">
          {completedCount}/{totalCount}
        </span>
      </div>

      {tasks.length === 0 && (
        <p className="text-sm text-mono-400 dark:text-mono-500">
          No dailies scheduled for today.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <button
            key={task._id}
            onClick={() => toggleTask(task._id, task.completed)}
            className="flex items-center gap-3 text-left w-full group cursor-pointer"
          >
            <span
              className={`
                w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors
                ${task.completed
                  ? "bg-lavender-500 border-lavender-500"
                  : "border-mono-300 dark:border-mono-600 group-hover:border-mono-400 dark:group-hover:border-mono-500"
                }
              `}
            >
              {task.completed && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.5 2.5 4.5-4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span
              className={`text-sm transition-colors hover:underline ${
                task.completed
                  ? "line-through text-mono-400 dark:text-mono-500"
                  : "text-mono-900 dark:text-mono-100"
              }`}
            >
              {task.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}