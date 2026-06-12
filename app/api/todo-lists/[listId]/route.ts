import "@/models";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { Collection, Task, TodoList } from "@/models";

import mongoose from "mongoose";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		
		await connectToDatabase();

		const url = new URL(req.url);
		const listId = url.pathname.split("/").pop();

		// populate will now work because Task is registered
		const list = await TodoList
			.findOne({ _id: listId, userId: session.user.id })
			.populate("tasks")
			.lean();

		if (!list) return new NextResponse("List not found", { status: 404 });

		return NextResponse.json(list, { status: 200 });
	} catch (err) {
		console.error("Error fetching list:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
	};
};

export async function DELETE(
	req: NextRequest, 
	context: { params: Promise<{listId: string}>},
) {
	
	try {
		const { listId } = await context.params;
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!mongoose.Types.ObjectId.isValid(listId)) return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
    	if (!mongoose.Types.ObjectId.isValid(session.user.id)) return NextResponse.json({ error: "Invalid user ID in session" }, { status: 400 });

		await connectToDatabase();

		const { searchParams } = new URL(req.url);
		const collectionId = searchParams.get("collectionId");

		if (!collectionId) return NextResponse.json({ messsage: "collectionId not provided" }, { status: 404 });

		const list = await TodoList.findOne({
			_id: listId,
			userId: session.user.id,
			collectionId,
		});

		if (!list) return NextResponse.json({ messsage: "List not found" }, { status: 404 });

		await Collection.updateOne(
			{ _id: collectionId },
			{ $pull: { todoLists: list._id } }
		);

		await TodoList.deleteOne({ _id: list._id });

		await Task.deleteMany({ listId: list._id });

		return NextResponse.json(
			{ message: "List deleted successfully", listId },
			{ status: 200 }
		);
		
	} catch (err) {
		console.error("Delete list error", err);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
};
