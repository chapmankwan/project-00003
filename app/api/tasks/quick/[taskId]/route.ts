import { connectToDatabase } from "@/lib/mongodb";
import { Task, TodoList } from "@/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { taskId } = await params;

  try {
    await connectToDatabase();

    const body = await request.json();
    const { completed } = body;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: session.user.email },
      {
        completed,
        dateCompleted: completed ? new Date() : null,
      },
      { new: true }
    ).select("text completed dateCompleted dueDate date order");

    if (!task) {
      return new Response("Task not found", { status: 404 });
    }

    return Response.json({
      _id: task._id.toString(),
      text: task.text,
      completed: task.completed,
      dateCompleted: task.dateCompleted ? task.dateCompleted.toISOString() : null,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      date: task.date ? task.date.toISOString() : null,
      order: task.order,
    });
  } catch (err) {
    console.error("Failed to update quick task:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { taskId } = await params;

  try {
    await connectToDatabase();

    const task = await Task.findOne({
      _id: taskId,
      userId: session.user.email,
    });

    if (!task) {
      return new Response("Task not found", { status: 404 });
    }

    // Remove from list
    await TodoList.updateOne(
      { _id: task.listId },
      { $pull: { tasks: task._id } }
    );

    // Delete task
    await Task.deleteOne({ _id: task._id });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Failed to delete quick task:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

