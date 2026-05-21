import "@/models";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { completeTodayTask, deleteTodayTask } from "@/lib/services/today.service";

interface Params {
  params: Promise<{ taskId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();

    if (typeof body.completed !== "boolean") {
      return NextResponse.json({ error: "completed (boolean) is required" }, { status: 400 });
    }

    await completeTodayTask(session.user.id, taskId, body.completed);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in PATCH /api/tasks/today/[taskId]:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();

    if (!body.listId) {
      return NextResponse.json({ error: "listId is required" }, { status: 400 });
    }

    await deleteTodayTask(session.user.id, taskId, body.listId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in DELETE /api/tasks/today/[taskId]:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}