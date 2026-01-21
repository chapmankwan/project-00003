import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { SubTask, Task } from "@/models";
import TodoList from "@/models/TodoList";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  	req: NextRequest,
	context: { params: Promise<{ listId: string; taskId: string, subTaskId: string }> }
) {
	try {
		const { listId, taskId, subTaskId } = await context.params;

		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		if (
			!mongoose.Types.ObjectId.isValid(listId) ||
			!mongoose.Types.ObjectId.isValid(taskId) ||
			!mongoose.Types.ObjectId.isValid(subTaskId)
		) {
			return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
		}

		await connectToDatabase();

		const body = await req.json();

		const updateFields: Partial<{
			completed: boolean;
			text: string;
			order: number;
		}> = {};

		if (typeof body.completed === "boolean") updateFields.completed = body.completed;
		if (typeof body.text === "string") updateFields.text = body.text;
		if (typeof body.order === "number") updateFields.order = body.order;

		const setObject = Object.entries(updateFields).reduce(
			(acc, [key, value]) => {
				acc[`tasks.$[task].subTasks.$[subtask].${key}`] = value;
				return acc;
			},
			{} as Record<string, unknown>
		);

		const updatedList = await TodoList.findOneAndUpdate(
			{
				_id: listId,
				userId: session.user.id,
			},
			{
				$set: setObject,
			},
			{
				new: true,
				arrayFilters: [
				{ "task._id": taskId },
				{ "subtask._id": subTaskId },
				],
			}
		);

		if (!updatedList) {
			return NextResponse.json({ message: "Not found" }, { status: 404 });
		}

		// Extract the updated subtask to return
		const task = updatedList.tasks.find(
			(t: Task) => t._id.toString() === taskId
		);
		const subtask = task?.subTasks.find(
			(st: SubTask) => st._id.toString() === subTaskId
		);

		return NextResponse.json(
			{
				message: "Subtask updated",
				subtask,
			},
			{ status: 200 }
		);
	} catch (err) {
			console.error("PATCH subtask error", err);
			return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
};

export async function DELETE(
	_: NextRequest,
	context: { params: Promise<{ listId: string; taskId: string, subTaskId: string }> }
) {
	try {
		const { listId, taskId, subTaskId } = await context.params;

		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		if (
			!mongoose.Types.ObjectId.isValid(listId) ||
			!mongoose.Types.ObjectId.isValid(taskId) ||
			!mongoose.Types.ObjectId.isValid(subTaskId)
		) {
			return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
		}

		await connectToDatabase();


		const updatedList = await TodoList.findOneAndUpdate(
			{
				_id: listId,
				userId: session.user.id,
				"tasks._id": taskId,
			},
			{
				$pull: {
				"tasks.$.subTasks": { _id: subTaskId },
				},
			},
			{ new: true }
		);

		if (!updatedList) return NextResponse.json({ message: "task/subtask not found" }, { status: 404 } );

		return NextResponse.json(
			{ message: "Subtask deleted", subTaskId },
			{ status: 200 }
		);

	} catch (err) {
		console.error("DELETE subtask error", err);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
