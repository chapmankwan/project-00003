import { connectToDatabase } from "@/lib/mongodb";
import { Task, TodoList } from "@/models";
import { getOrCreateSystemList } from "@/lib/services/todolist.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";
import type { Types } from "mongoose";

interface TaskResponse {
  _id: string;
  text: string;
  completed: boolean;
  dateCompleted: string | null;
  dueDate: string | null;
  date: string | null;
  order: number;
  createdAt: string;
  movedAt?: string | null;
  archived?: boolean;
}

interface QuickTaskLean {
  _id: Types.ObjectId;
  text: string;
  completed: boolean;
  dateCompleted?: Date | null;
  dueDate?: Date | null;
  date?: Date | null;
  order: number;
  createdAt: Date;
  movedAt?: Date | null;
  archived?: boolean;
}

function serializeTask(t: QuickTaskLean): TaskResponse {
  return {
    _id: t._id.toString(),
    text: t.text,
    completed: t.completed,
    dateCompleted: t.dateCompleted ? t.dateCompleted.toISOString() : null,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    date: t.date ? t.date.toISOString() : null,
    order: t.order,
    createdAt: t.createdAt.toISOString(),
    movedAt: t.movedAt ? t.movedAt.toISOString() : null,
    archived: !!t.archived,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    const query: {
      userId: string;
      type: string;
      date?: { $gte: Date; $lte: Date };
    } = {
      userId: session.user.id,
      type: "quick-task",
    };

    if (date) {
      // Parse `date` (YYYY-MM-DD) as local-midnight bounds to avoid timezone ambiguity.
      const parts = date.split("-").map(p => parseInt(p, 10));
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
        const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);

        query.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    const tasks = await Task.find(query)
      .select("text completed dateCompleted dueDate date order createdAt movedAt archived")
      .sort({ order: 1 })
      .lean<QuickTaskLean[]>();

    console.log('[api/tasks/quick] GET result count', tasks.length);

    return Response.json(tasks.map(serializeTask));
  } catch (err) {
    console.error("Failed to fetch quick tasks:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    const { text, date, dueDate } = body;

    

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    const userId = session.user.id;

    const list = await getOrCreateSystemList(userId, "today") as { _id: Types.ObjectId } | null;

    if (!list) {
      return new Response("Failed to create system list", { status: 500 });
    }

    const listId = list._id;

    const lastTask = await Task.findOne({ userId, listId })
      .sort({ order: -1 })
      .select("order")
      .lean<{ order: number } | null>();

    const nextOrder = lastTask ? lastTask.order + 1 : 0;

    // If a date string was supplied, create the task.date at local-midnight for that date.
    let taskDate: Date | undefined = undefined;
    if (date) {
      const parts = date.split("-").map((p: string) => parseInt(p, 10));
      if (parts.length === 3) {
        const [y, m, d] = parts;
        taskDate = new Date(y, m - 1, d, 0, 0, 0, 0);
      }
    }

    const task = await Task.create({
      userId,
      listId,
      text,
      completed: false,
      order: nextOrder,
      type: "quick-task",
      date: taskDate ?? new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    

    await TodoList.updateOne(
      { _id: listId },
      { $push: { tasks: task._id } }
    );

    return Response.json(
      serializeTask({
        _id: task._id,
        text: task.text,
        completed: task.completed,
        dateCompleted: null,
        dueDate: task.dueDate,
        date: task.date,
        order: task.order,
        createdAt: task.createdAt,
        movedAt: null,
        archived: false,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create quick task:", err);
    return new Response("Internal server error", { status: 500 });
  }
}