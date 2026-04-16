import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { Task } from "@/models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();

    const overdueTasks = await Task.find({
      userId: session.user.id,
      completed: false,
      dueDate: { $lt: now, $ne: null },
    })
      .populate("listId", "name")
      .select("text dueDate priority listId")
      .sort({ dueDate: 1 })
      .limit(10)
      .lean();

    return NextResponse.json(overdueTasks, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/tasks/overdue:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}