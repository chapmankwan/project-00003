import "@/models";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { createTodayTask, getTodayTasks } from "@/lib/services/today.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "date param required" }, { status: 400 });
    }

    const result = await getTodayTasks(session.user.id, dateParam);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/tasks/today:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
 
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const body = await req.json();
    console.log("+++ body", body);
 
    if (!body.text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
 
    if (!body.listId) {
      return NextResponse.json({ error: "listId is required" }, { status: 400 });
    }
 
    const task = await createTodayTask(session.user.id, body.listId, body.text.trim());
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/tasks/today:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
 