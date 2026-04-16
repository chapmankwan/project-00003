import { connectToDatabase } from "@/lib/mongodb";
import { Daily } from "@/models";
import { toMidnightUTC } from "@/lib/streak";
import { DailyDoc, DailyTaskDoc } from "@/lib/types/models";

export interface DailyTaskItem {
  _id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface DailyListResult {
  _id: string;
  date: string;
  completedCount: number;
  totalCount: number;
  tasks: DailyTaskItem[];
}

/**
 * Fetches the daily list for a given date.
 * Returns null if no list exists — does not generate one.
 */
export async function getDailyForDate(
  userId: string,
  date: Date
): Promise<DailyListResult | null> {
  await connectToDatabase();

  const normalizedDate = new Date(toMidnightUTC(date));

  const daily = await Daily.findOne({ userId, date: normalizedDate })
    .populate({ path: "tasks", options: { sort: { order: 1 } } })
    .lean<DailyDoc>();

  if (!daily) return null;

  const tasks = daily.tasks as DailyTaskDoc[];

  return {
    _id: daily._id.toString(),
    date: daily.date.toISOString(),
    completedCount: daily.completedCount,
    totalCount: daily.totalCount,
    tasks: tasks.map(t => ({
      _id: t._id.toString(),
      text: t.text,
      completed: t.completed,
      order: t.order,
    })),
  };
}