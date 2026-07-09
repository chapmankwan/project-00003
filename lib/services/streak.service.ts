import { connectToDatabase } from "@/lib/mongodb";
import { Daily, DailyTask, DailyTaskTemplate } from "@/models";
import {
  calculateGlobalStreak,
  calculatePerHabitStreaks,
  toMidnightUTC,
  type HabitStreak,
} from "@/lib/streak";
import { DailyDoc, DailyTaskDoc } from "@/lib/types/models";

const LOOKBACK_DAYS = 90;

export interface StreakResult {
  globalStreak: number;
  todayCompleted: number;
  todayTotal: number;
  perHabit: HabitStreak[];
}

/**
 * Fetches and calculates streak data for a user.
 * Looks back 90 days from today.
 */
export async function getStreakData(userId: string): Promise<StreakResult> {
  await connectToDatabase();

  const todayMs = toMidnightUTC(new Date());
  const lookbackDate = new Date(todayMs - LOOKBACK_DAYS * 86_400_000);

  const [dailyRecords, habitTasks] = await Promise.all([
    Daily.find({ userId, date: { $gte: lookbackDate } })
      .select("date completedCount totalCount")
      .sort({ date: -1 })
      .lean<DailyDoc[]>(),

    DailyTask.find({ userId, date: { $gte: lookbackDate } })
      .select("templateId text date completed")
      .lean<DailyTaskDoc[]>(),
  ]);

  const templateIds = Array.from(new Set(habitTasks.map(task => task.templateId.toString())));
  const templates = templateIds.length > 0
    ? await DailyTaskTemplate.find({ userId, _id: { $in: templateIds } })
        .select("_id recurrence")
        .lean<Array<{ _id: string; recurrence?: string }>>()
    : [];

  const recurrenceByTemplate = new Map(
    templates.map(template => [template._id.toString(), template.recurrence])
  );

  const globalStreak = calculateGlobalStreak(
    dailyRecords.map(r => ({
      date: r.date,
      completedCount: r.completedCount,
      totalCount: r.totalCount,
    }))
  );

  const todayRecord = dailyRecords.find(
    r => toMidnightUTC(r.date) === todayMs
  );

  const perHabit = calculatePerHabitStreaks(
    habitTasks.map(t => ({
      templateId: t.templateId.toString(),
      text: t.text,
      date: t.date,
      completed: t.completed,
      recurrence: recurrenceByTemplate.get(t.templateId.toString()),
    }))
  );

  return {
    globalStreak,
    todayCompleted: todayRecord?.completedCount ?? 0,
    todayTotal: todayRecord?.totalCount ?? 0,
    perHabit,
  };
}