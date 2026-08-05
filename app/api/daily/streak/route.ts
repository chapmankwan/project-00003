import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Daily, DailyTask, DailyTaskTemplate } from "@/models";

import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import {
  calculateGlobalStreak,
  calculatePerHabitStreaks,
  toMidnightUTC,
} from "@/lib/streak";

const LOOKBACK_DAYS = 90;

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const localDateUtc = searchParams.get("localDateUtc");
        const referenceDate = localDateUtc ? new Date(localDateUtc) : new Date();
        const userId = session.user.id;
        const normalizedUserId = Types.ObjectId.isValid(userId)
            ? new Types.ObjectId(userId)
            : userId;
        const todayMs = toMidnightUTC(referenceDate);
        const lookbackDate = new Date(todayMs - LOOKBACK_DAYS * 86_400_000);

        // Fetch daily records for the last 90 days, sorted: descending
        const dailyRecords = await Daily.find({
            userId: normalizedUserId,
            date: { $gte: lookbackDate },
        })
            .select("date completedCount totalCount isHoliday")
            .sort({ date: -1 })
            .lean();

        // Exclude today from past records, as today possibly isn't complete and will break the streaks
        const todayRecord = dailyRecords.find( dailyRecord => toMidnightUTC(dailyRecord.date) === todayMs );

        const holidayDates = new Set(
          dailyRecords
            .filter(r => r.isHoliday)
            .map(r => toMidnightUTC(r.date))
        );

        const globalStreak = calculateGlobalStreak(
            dailyRecords.map((r) => ({
                date: r.date,
                completedCount: r.completedCount,
                totalCount: r.totalCount,
                isHoliday: r.isHoliday,
            })),
            referenceDate
        );

        // Fetch individual DailyTask records for per-habit streaks
        // Only require templateId, text, date, and completed fields
        const habitTasks = await DailyTask.find({
            userId: normalizedUserId,
            date: { $gte: lookbackDate },
        })
            .select("templateId text date completed")
            .lean<Array<{ templateId: Types.ObjectId | string; text: string; date: Date; completed: boolean }>>();

        const templateIds = Array.from(
            new Set(
                habitTasks
                    .map(task => task.templateId?.toString())
                    .filter((id): id is string => Boolean(id))
            )
        );

        const templates = templateIds.length > 0
            ? await DailyTaskTemplate.find({
                userId: normalizedUserId,
                _id: { $in: templateIds.map(id => new Types.ObjectId(id)) },
            })
                .select("_id recurrence")
                .lean<Array<{ _id: Types.ObjectId | string; recurrence?: string }>>()
            : [];

        const recurrenceByTemplate = new Map(
            templates.map(template => [template._id.toString(), template.recurrence])
        );

        const perHabit = calculatePerHabitStreaks(
            habitTasks.map(task => ({
                templateId: task.templateId.toString(),
                text: task.text,
                date: task.date,
                completed: task.completed,
                recurrence: recurrenceByTemplate.get(task.templateId.toString()),
            })),
            referenceDate,
            holidayDates
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