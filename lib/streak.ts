export interface DailyRecord {
  date: Date;
  completedCount: number;
  totalCount: number;
  isHoliday?: boolean;
}

export interface PerHabitRecord {
  templateId: string;
  text: string;
  date: Date;
  completed: boolean;
  recurrence?: string;
  isHoliday?: boolean;
}

export interface HabitStreak {
  templateId: string;
  text: string;
  streak: number;
}

export interface StreakResult {
  globalStreak: number;
  todayCompleted: number;
  todayTotal: number;
  perHabit: HabitStreak[];
}

import { shouldIncludeTemplate } from "@/lib/date";

function isHabitScheduled(recurrence: string | undefined, date: Date): boolean {
  if (!recurrence?.trim()) return true;
  return shouldIncludeTemplate(recurrence, date);
}

/**
 * Normalizes a date to midnight UTC for safe comparison.
 * @param date Date
 * @returns normalized date in midnight UTC
 */
export function toMidnightUTC(date: Date): number {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Calculate global streak from a list of Dailies (DailyRecords)
 * Records required to be sorted descending by date, most recent should be first
 * Exclude _today_ from the streak since it is in progress
 * @param records 
 * @returns Number for continuous global streak
 */
export function calculateGlobalStreak(records: DailyRecord[], referenceDate: Date = new Date()): number {
  const todayMs = toMidnightUTC(referenceDate);
  const yesterdayMs = todayMs - 86_400_000;

  const past = records
    .filter(r => toMidnightUTC(r.date) <= yesterdayMs)
    .sort((a, b) => toMidnightUTC(b.date) - toMidnightUTC(a.date));

  if (past.length === 0) return 0;

  const recordByDate = new Map<number, DailyRecord>();
  for (const record of past) {
    recordByDate.set(toMidnightUTC(record.date), record);
  }

  let streak = 0;
  let cursorMs = yesterdayMs;

  while (true) {
    const record = recordByDate.get(cursorMs);
    if (!record) break;

    if (record.isHoliday) {
      cursorMs -= 86_400_000;
      continue;
    }

    if (record.totalCount === 0) break;
    if (record.completedCount !== record.totalCount) break;

    streak++;
    cursorMs -= 86_400_000;
  }

  return streak;
};

/**
 * Calculates per-habit streaks from individual DailyTask records.
 * Groups by templateId, sorts descending, walks back from yesterday.
 * @params tasks
 * @return sorted streaking by tasks
 */
export function calculatePerHabitStreaks(
  tasks: PerHabitRecord[],
  referenceDate: Date = new Date(),
  holidayDates: Set<number> = new Set()
): HabitStreak[] {
  const todayMs = toMidnightUTC(referenceDate);
  const yesterdayMs = todayMs - 86_400_000;

  // Group tasks by templateId
  const grouped = new Map<string, { text: string; tasks: PerHabitRecord[] }>();

  for (const task of tasks) {
    const key = task.templateId;
    if (!grouped.has(key)) {
      grouped.set(key, { text: task.text, tasks: [] });
    }
    grouped.get(key)!.tasks.push(task);
  }

  const results: HabitStreak[] = [];

  for (const [templateId, { text, tasks: habitTasks }] of grouped) {
    const recurrence = habitTasks.find(t => t.recurrence)?.recurrence;

    console.log("+++ recurrence for templateId", templateId, "is", recurrence);

    // Sort descending
    const sorted = habitTasks
      .filter(t => toMidnightUTC(t.date) <= yesterdayMs)
      .sort((a, b) => toMidnightUTC(b.date) - toMidnightUTC(a.date));

    if (sorted.length === 0) {
      results.push({ templateId, text, streak: 0 });
      continue;
    }

    const taskByDate = new Map<number, PerHabitRecord>();
    for (const task of sorted) {
      taskByDate.set(toMidnightUTC(task.date), task);
    }

    const earliestTaskDateMs = toMidnightUTC(sorted[sorted.length - 1].date);
    let streak = 0;

    for (let cursorMs = yesterdayMs; cursorMs >= earliestTaskDateMs; cursorMs -= 86_400_000) {
      const cursorDate = new Date(cursorMs);

      if (!isHabitScheduled(recurrence, cursorDate)) {
        continue;
      }

      if (holidayDates.has(cursorMs)) {
        continue;
      }

      const task = taskByDate.get(cursorMs);
      if (!task) {
        break;
      }

      if (!task.completed) {
        break;
      }

      streak++;
    }

    results.push({ templateId, text, streak });
  }

  // Sort by streak descending for cleaner UI display
  return results.sort((a, b) => b.streak - a.streak);
}