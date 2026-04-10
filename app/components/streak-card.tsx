"use client";

import { useState } from "react";

interface HabitStreak {
  templateId: string;
  text: string;
  streak: number;
}

interface StreakCardProps {
  globalStreak: number;
  todayCompleted: number;
  todayTotal: number;
  perHabit: HabitStreak[];
}

export const StreakCard = ({
  globalStreak,
  todayCompleted,
  todayTotal,
  perHabit,
}: StreakCardProps) => {
  const [expanded, setExpanded] = useState(false);

//   const weekPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        Streak
      </p>

      <div className="flex items-center gap-6">
        <div>
          <p className="text-4xl font-medium text-zinc-900 dark:text-zinc-100 leading-none">
            {globalStreak}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            day streak
          </p>
        </div>

        <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />

        <div>
          <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 leading-none">
            {todayCompleted}/{todayTotal}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            today
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(prev => !prev)}
        className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        {expanded ? "▾" : "▸"} per-habit breakdown
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {perHabit.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No habit data yet.
            </p>
          )}
          {perHabit.map(habit => (
            <div
              key={habit.templateId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-500 dark:text-zinc-400">
                {habit.text}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                {habit.streak}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}