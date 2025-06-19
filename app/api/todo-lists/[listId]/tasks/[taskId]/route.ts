import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TodoList from "@/models/TodoList";
import mongoose, { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ listId: string; taskId: string }> }

) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { listId, taskId } = await context.params;

        const body = await req.json();

        // Validate task ID
        if (!mongoose.Types.ObjectId.isValid(taskId)) return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });

        const objectTaskId = new Types.ObjectId(taskId);

        // Only include valid updates
        const updateFields: Partial<{
            completed: boolean;
            text: string;
        }> = {};

        if (typeof body.completed === "boolean") updateFields.completed = body.completed;
        if (typeof body.text === "string") updateFields.text = body.text;

        // Build $set object dynamically
        const setObject = Object.entries(updateFields).reduce((acc, [key, value]) => {
            acc[`tasks.$.${key}`] = value;
            return acc;
        }, {} as Record<string, unknown>);

        const list = await TodoList.findOneAndUpdate(
            {
                _id: listId,
                userId: session.user.id,
                "tasks._id": objectTaskId,
            },
            { $set: setObject },
            { new: true }
        );

        if (!list) {
            return NextResponse.json({ message: "List or task not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Task updated successfully",
            task: { ...updateFields, _id: taskId },
        }, { status: 200 });

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

        await connectToDatabase();

        const { listId, taskId } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
			return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
		};

        const list = await TodoList.findOneAndUpdate(
			{ _id: listId, userId: session.user.id },
			{ $pull: { tasks: { _id: taskId } } },
			{ new: true }
		);

		if (!list) return NextResponse.json({ message: "List not found" }, { status: 404 });

        return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
    } catch (err) {
        console.error("DELETE task error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}