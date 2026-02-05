import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import Task from "@/models/Task";
import TodoList from "@/models/TodoList";

import { NextRequest, NextResponse } from "next/server";

// Create new task
export async function POST(
    req: NextRequest, 
    context: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { text, description, priority, order } = await req.json();

        const { listId } = await context.params;

        // Validate list belonds to user and is valid
        const list = await TodoList.findOne({
            _id: listId,
            userId: session.user.id,
        });
        if (!list) return NextResponse.json({ error: "TodoList not found" }, { status: 404 });

        const task = await Task.create({
            userId: session.user.id,
            listId,
            text,
            order,
            description,
            priority: priority ?? "moderate",
            date: new Date().toISOString(),
        });

        await TodoList.updateOne(
            { _id: list._id }, // use validated list's _id
            { $push: { tasks: task._id } }
        );

        return NextResponse.json(task, { status: 201 });
        
    } catch (err) {
        console.error( "Error with the task api", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    };
};

// Delete ALL existing tasks in list by setting it empty
export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ listId: string}> }
) {
    try {
        const { listId } = await context.params;
        await connectToDatabase();

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find the list that belongs to the user
        const list = await TodoList.findOneAndUpdate(
            { _id: listId, userId: session.user.id },
            { $set: { tasks: [] } }, // clear tasks array
            { new: true }
        );

        if (!list) {
            return NextResponse.json(
                { error: "List not found or not owned by user" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "All tasks deleted successfully", listId, deleted: true },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error deleting tasks:", err);
        return NextResponse.json(
            { error: "Failed to delete tasks" },
            { status: 500 }
        );
    }
};
