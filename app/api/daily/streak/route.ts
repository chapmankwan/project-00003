import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Daily, DailyTask } from "@/models";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  calculateGlobalStreak,
  calculatePerHabitStreaks,
  toMidnightUTC,
} from "@/lib/streak";

const LOOKBACK_DAYS = 90;

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const userId = session.user.id;
        const todayMs = toMidnightUTC(new Date());
        const lookbackDate = new Date(todayMs - LOOKBACK_DAYS * 86_400_000);

        // Fetch daily records for the last 90 days, sorted: descending
        const dailyRecords = await Daily.find({
            userId,
            date: { $gte: lookbackDate },
        })
            .select("date completedCount totalCount")
            .sort({ date: -1 })
            .lean();

        // Exclude today from past records, as today possibly isn't complete and will break the streaks
        const todayRecord = dailyRecords.find( dailyRecord => toMidnightUTC(dailyRecord.date) === todayMs );

        const globalStreak = calculateGlobalStreak(
            dailyRecords.map((r) => ({
                date: r.date,
                completedCount: r.completedCount,
                totalCount: r.totalCount,
            }))
            );

        // Fetch individual DailyTask records for per-habit streaks
        // Only require templateId, text, date, and completed fields
        const habitTasks = await DailyTask.find({
            userId,
            date: { $gte: lookbackDate },
        })
            .select("templateId text date completed")
            .lean();
    
        const perHabit = calculatePerHabitStreaks(
            habitTasks.map( task => ({
                templateId: task.temmplateId.toString(),
                text: task.text,
                date: task.date,
                completed: task.completed
            }))
        );

        return NextResponse.json({
            globalStreak,
            todayCompleted: todayRecord?.completedCount ?? 0,
            todayTotal: todayRecord?.totalCount ?? 0,
            perHabit,
        });
    } catch (err) {
        console.error("Error in GET /api/daily/streak: ", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    };
};