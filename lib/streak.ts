export interface DailyRecord {
  date: Date;
  completedCount: number;
  totalCount: number;
}

export interface PerHabitRecord {
  templateId: string;
  text: string;
  date: Date;
  completed: boolean;
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
export function calculateGlobalStreak(records: DailyRecord[]): number {
  const todayMs = toMidnightUTC(new Date());
  const yesterdayMs = todayMs - 86_400_000;

  // Filter out today, work only from yesterday backwards
  const past = records.filter(r => toMidnightUTC(r.date) <= yesterdayMs);

  if (past.length === 0) return 0;

  // Check if yesterday exists and is complete, if not, then streak is 0
  const mostRecent = toMidnightUTC(past[0].date);
  if (mostRecent !== yesterdayMs) return 0;

  let streak = 0;
  let expectedMs = yesterdayMs;

  for (const record of past) {
    const recordMs = toMidnightUTC(record.date);

    if (recordMs !== expectedMs) break; // streak ends if gap in days
    if (record.totalCount === 0) break; // no tasks that day, do not count, for reoccurence
    if (record.completedCount !== record.totalCount) break; // if incomplete, streak ends

    streak++;
    expectedMs -= 86_400_000;
  }

  return streak;
};

/**
 * Calculates per-habit streaks from individual DailyTask records.
 * Groups by templateId, sorts descending, walks back from yesterday.
 * @params tasks
 * @return sorted streaking by tasks
 */
export function calculatePerHabitStreaks(tasks: PerHabitRecord[]): HabitStreak[] {
  const todayMs = toMidnightUTC(new Date());
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
    // Sort descending
    const sorted = habitTasks
      .filter(t => toMidnightUTC(t.date) <= yesterdayMs)
      .sort((a, b) => toMidnightUTC(b.date) - toMidnightUTC(a.date));

    if (sorted.length === 0) {
      results.push({ templateId, text, streak: 0 });
      continue;
    }

    // If most recent past entry isn't yesterday, streak is 0
    if (toMidnightUTC(sorted[0].date) !== yesterdayMs) {
      results.push({ templateId, text, streak: 0 });
      continue;
    }

    let streak = 0;
    let expectedMs = yesterdayMs;

    for (const task of sorted) {
      const taskMs = toMidnightUTC(task.date);
      if (taskMs !== expectedMs) break;
      if (!task.completed) break;
      streak++;
      expectedMs -= 86_400_000;
    }

    results.push({ templateId, text, streak });
  }

  // Sort by streak descending for cleaner UI display
  return results.sort((a, b) => b.streak - a.streak);
}