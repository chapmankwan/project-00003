import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import SubTask from "@/models/SubTask";
import Task from "@/models/Task";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function extractIds(pathname: string) {
  const segments = pathname.split("/");

  const listIndex = segments.indexOf("todo-lists");
  const taskIndex = segments.indexOf("tasks");

  return {
    listId: segments[listIndex + 1],
    taskId: segments[taskIndex + 1],
  };
}

export async function GET(
    req: NextRequest
) {
    try {
        const { listId, taskId } = extractIds(req.nextUrl.pathname)

        if (!listId || !taskId) return NextResponse.json( {message: "Missing params"}, {status: 400} );

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        if (
            !mongoose.Types.ObjectId.isValid(listId) ||
            !mongoose.Types.ObjectId.isValid(taskId)
        ) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        // Ensures task is by user 
        const task = Task.findOne({
            taskId,
            userId: session.user.id,
        }).lean();

        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        const subtasks = await SubTask.find({
            taskId,
            userId: session.user.id,
        })
        .sort({ order: 1 })
        .lean();

        return NextResponse.json( subtasks, { status: 200 });
    } catch (err) {
        console.error("GET subtasks error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    };
};

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ listId: string; taskId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { listId, taskId } = await context.params;
        const { text, order } = await req.json();

        if (!text)
      return NextResponse.json({ error: "Text required" }, { status: 400 });

        // security
        const task = await Task.findOne({
            _id: taskId,
            userId: session.user.id,
        });

        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        if (!mongoose.Types.ObjectId.isValid(listId)) return NextResponse.json({ message: "Invalid list ID" }, { status: 400 });
        if (!mongoose.Types.ObjectId.isValid(taskId)) return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });

        const subTask = await SubTask.create({
            userId: session.user.id,
            taskId,
            listId: listId,
            text,
            order: order ?? task.subTasks.length,
        });

        await Task.findByIdAndUpdate(taskId, {
            $push: { subTasks: subTask._id },
        });

        return NextResponse.json(subTask, { status: 201 });

    } catch (err) {
        console.log("POST subtask error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    };
};