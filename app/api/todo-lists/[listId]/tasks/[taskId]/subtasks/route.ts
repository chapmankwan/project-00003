import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Task } from "@/models/interfaces";
import TodoList from "@/models/TodoList";
import mongoose, { Types } from "mongoose";
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

        const list = await TodoList.findOne(
        {
            _id: listId,
            userId: session.user.id,
            "tasks._id": taskId,
        },
        {
            "tasks.$": 1, // project only the matched task
        }
        ).lean();

        if (!list || Array.isArray(list) || !list.tasks?.length) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        };

        const subTasks = list.tasks[0].subTasks ?? [];

        return NextResponse.json(subTasks, { status: 200 });
    } catch (err) {
        console.error("GET subtasks error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
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

        if (!mongoose.Types.ObjectId.isValid(listId)) return NextResponse.json({ message: "Invalid list ID" }, { status: 400 });
        if (!mongoose.Types.ObjectId.isValid(taskId)) return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });

        const objectTaskId = new Types.ObjectId(taskId);

        const updatedList = await TodoList.findOneAndUpdate(
            {
                _id: listId,
                userId: session.user.id,
                "tasks._id": objectTaskId,
            },
            {
                $push: {
                    "tasks.$.subTasks": {
                        text,
                        completed: false,
                        order
                    },
                },
            },
            { new: true }
        );

        const updatedTask = updatedList?.tasks.find( (task: Task) => {
            return task._id.toString() === taskId
        });

        const subTasks = updatedTask.subTasks.find( (subTask: { text: string; }) => subTask.text ===  text)

        return NextResponse.json(subTasks, { status: 200 });

    } catch (err) {
        console.log("PATCH subtask error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    };
};