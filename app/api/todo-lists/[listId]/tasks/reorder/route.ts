import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import TodoList from "@/models/TodoList";
import { Task } from "@/models";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{listId: string}> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderedIds } = await req.json();
        const { listId } = await context.params;
        await connectToDatabase();

        const list = await TodoList.findOne({
            _id: listId,
            userId: session.user.id,
        });

        if (!list) {
            return NextResponse.json({ error: "List not found" }, { status: 404 });
        }

        list.tasks.forEach((task: Task) => {task.order = orderedIds.indexOf(task._id.toString());});
        await list.save();

        return NextResponse.json({ success: true });
        
    } catch (err) {
        console.error("Error reordering tasks:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}