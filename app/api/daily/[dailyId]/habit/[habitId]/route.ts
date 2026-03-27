import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import { Daily, DailyTask } from "@/models";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(
    _: NextRequest,
    context: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { habitId } = await context.params;

        await connectToDatabase();

        const task = await DailyTask.findOne({
            _id: habitId,
            userId: session.user.id,
        });

        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        task.completed = !task.completed;
        await task.save();
        
        // Update Daily summary counts
        const [completedCount, totalCount] = await Promise.all([
            DailyTask.countDocuments({ dailyId: task.dailyId, completed: true }),
            DailyTask.countDocuments({ dailyId: task.dailyId }),
        ]);

        await Daily.updateOne(
            { _id: task.dailyId },
            { $set: { completedCount, totalCount } }
        );

        return NextResponse.json({ task, completedCount, totalCount });

    } catch (err) {
        console.error("Error toggling daily task:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}