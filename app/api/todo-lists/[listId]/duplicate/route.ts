import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { Collection, Task, TodoList } from "@/models";

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
        const original = await TodoList.findOne({
            _id: listId,
            userId: session.user.id,
        });

        if (!original) return NextResponse.json({ error: "List not found" }, { status: 404 });

        // Duplicate list first
        const duplicateList = await TodoList.create({
            userId: original.userId,
            collectionId: original.collectionId,
            title: `${original.title} (Copy)`,
            slug: `${original.slug}-copy-${Date.now()}`,
            priority: original.priority,
            tasks: [],
        });

        // Get the original tasks from the original list
        const originalTasks = await Task.find({
            _id: { $in: original.tasks },
            userId: session.user.id,
        }).lean();

        // Duplicate those tasks so they have their own _id, but attach the duplicated lists listId
        // Also reset everything necessary
        const duplicatedTasks = await Task.insertMany(
            originalTasks.map(task => ({
                userId: task.userId,
                listId: duplicateList._id,
                text: task.text,
                description: task.description,
                priority: task.priority,
                completed: false,
                edited: false,
                order: task.order,
                date: task.date,
            }))
        );

        // Add the tasks to the list
        duplicateList.tasks = duplicatedTasks.map(t => t._id);
        // save the list
        await duplicateList.save();

        await Collection.updateOne(
            { _id: original.collectionId },
            { $push: { todoLists: duplicateList._id } }
        );

        return NextResponse.json(duplicateList);

    } catch (err) {
        console.error("Error in copying list", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    };
}