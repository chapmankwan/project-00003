import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import TodoList from "@/models/TodoList";
import Task from "@/models/Task";

import { Task as TaskType} from "@/models";

export async function POST(
    _req: NextRequest,
	context: { params: Promise<{listId: string}>},
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        await connectToDatabase();

        const { listId } = await context.params;

        // Find the original list in db
        const original = await TodoList.findById(listId);
        if (!original) return NextResponse.json({ error: "List not found" }, { status: 404 });

        // Duplicate the tasks
        const duplicateTasks = await Task.insertMany(
            original.tasks.map( (task: TaskType) => ({
                text: task.text,
                completed: false,  //reset task completion
                description: task.description,
                priority: task.priority,
                edited: false,
                userId: original.userId,
                order: task.order,
            }))
        );

        const duplicateList = await TodoList.create({
            userId: original.userId,
            collectionId: original.collectionId,
            title: `${original.title} (Copy)`,
            slug: `${original.slug}-copy-${Date.now()}`,
            priority: original.priority,
            tasks: duplicateTasks,
        });

        return Response.json(duplicateList);

    } catch (err) {
        console.error("Error in copying list", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    };
}