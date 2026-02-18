import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import { DailyTask } from "@/models";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ taskId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { taskId } = await context.params;

        await connectToDatabase();

        const body = await req.json();

        const updated = await DailyTask.findOneAndUpdate(
            {
                _id: taskId,
                userId: session.user.id,
            },
            { $set: body },
            { new: true }
        );

        if (!updated)
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("Error updating daily task:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}