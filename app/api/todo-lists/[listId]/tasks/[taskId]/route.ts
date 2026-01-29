import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import Task from "@/models/Task";
import TodoList from "@/models/TodoList";
import mongoose from "mongoose";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ listId: string; taskId: string }> }

) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        
        const { listId, taskId } = await context.params;
        
        if (!mongoose.Types.ObjectId.isValid(listId) || !mongoose.Types.ObjectId.isValid(taskId)) {
            return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
        }

        await connectToDatabase();

        const body = await req.json();


        const updates: Record<string, boolean> = {};
        // Explicit allowlist
        if (typeof body.completed === "boolean") updates.completed = body.completed;
        if (typeof body.text === "string") updates.text = body.text.trim();
        if (typeof body.priority === "string") updates.priority = body.priority;
        if (typeof body.description === "string") updates.description = body.description;
        if (typeof body.edited === "boolean") updates.edited = body.edited;

        const task = await Task.findOneAndUpdate(
            {
                _id: taskId,
                listId,
                userId: session.user.id,
            },
            {
                $set: updates,
            },
            { new: true }
        );

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task, { status: 200 });

    } catch (err) {
        console.error("PATCH task error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    _: NextRequest, 
    context: { params: Promise<{ listId: string; taskId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json( { message: "Unauthorized" }, { status: 401 } );

        
        const { listId, taskId } = await context.params;
        
        if (!mongoose.Types.ObjectId.isValid(listId) || !mongoose.Types.ObjectId.isValid(taskId)) {
            return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
		};

        await connectToDatabase();

        const deletedTask = await Task.findOneAndDelete({
            _id: taskId,
            listId,
            userId: session.user.id
        });

        if (!deletedTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        // Remove reference from the todolist
        await TodoList.updateOne(
            { _id: listId, userId: session.user.id },
            { $pull: { tasks: taskId } }
        );
        
        return NextResponse.json(
            { message: "Task deleted successfully", deletedTaskId: taskId },
            { status: 200 }
        );

    } catch (err) {
        console.error("DELETE task error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}