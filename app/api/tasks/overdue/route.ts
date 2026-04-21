import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getOverdueTasks } from "@/lib/services/task.service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await getOverdueTasks(session.user.id);
    return NextResponse.json(tasks, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/tasks/overdue:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}