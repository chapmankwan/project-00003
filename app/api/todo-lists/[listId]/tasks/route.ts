import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

        const { text, order } = await req.json();
        const { listId } = await context.params;

        const updatedList = await TodoList.findOneAndUpdate(
            { _id: listId, userId: session.user.id },
            {
                $push: {
                    tasks: {
                        id: crypto.randomUUID(),
                        text,
                        completed: false,
                        edited: false,
                        date: new Date().toISOString(),
                        order,
                    },
                },
            },
            {new: true},
        );

        return NextResponse.json(updatedList, { status: 200 } );

    } catch (err) {
        console.error( "Error with the task api", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    };
};

// Update an existing task

export async function PATCH(
    req: NextRequest, 
    context: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { taskId, update } = await req.json();

        const { listId } = await context.params;

        const updatedList = await TodoList.findOneAndUpdate(
            { _id: listId, userId: session.user.id, "tasks._id": taskId },
            { $set: { "tasks.$": { ...update, _id: taskId } } },
            { new: true },
        );

        return NextResponse.json(updatedList, { status: 200 } );

    } catch (err) {
        console.error( "Error with the task api", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    };
};

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
