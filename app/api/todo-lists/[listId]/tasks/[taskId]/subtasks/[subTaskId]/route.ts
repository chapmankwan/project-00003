import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import { SubTask, Task } from "@/models";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Currently only toggles completion on the subtask - editing text to come
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

		const updates = await req.json();

		const subtask = await SubTask.findOneAndUpdate(
			{ _id: subTaskId, userId: session.user.id },
			updates,
			{ new: true }
		);

		if (!subtask) return NextResponse.json({ error: "SubTask not found" }, { status: 404 });

		return NextResponse.json(subtask, { status: 200 });
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

		const subtask = await SubTask.findOneAndDelete({
			_id: subTaskId,
			userId: session.user.id,
		});

		if (!subtask) return NextResponse.json({ error: "SubTask not found" }, { status: 404 });

		await Task.findByIdAndUpdate(subtask.taskId, {
			$pull: { subTasks: subtask._id },
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("DELETE subtask error", err);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
