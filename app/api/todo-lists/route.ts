import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TodoList from "@/models/TodoList";
import { NextRequest, NextResponse } from "next/server";
import { toSlug } from "@/app/utilities";
import mongoose from "mongoose";
import Collection from "@/models/Collection";

export async function GET( req: NextRequest ) {

	try {
		const session = await getServerSession( authOptions );
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { searchParams } = new URL(req.url);
		const collectionId = searchParams.get("collectionId");

		await connectToDatabase();

		// let lists;
		const collection = await Collection.findOne({
			_id: collectionId,
			userId: session.user.id,
		})
		.populate("todoLists")
		.lean();

		// if (!collectionId) {
		// 	lists = await TodoList.find({
		// 		userId: new mongoose.Types.ObjectId(session.user.id)
		// 	})
		// } else {
		// 	// Temp so we are able to grab all the todolists in /workspaces
		// 	lists = await TodoList.find({
		// 		userId: new mongoose.Types.ObjectId(session.user.id),
		// 		collectionId,
		// 	});
		// };

		return NextResponse.json(collection, { status: 200 });
		
	} catch (err) {
		console.error( "GET /api/todo-lists error", err );
		return new NextResponse("Internal Server Error", { status: 500 });
	}

};

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const userId = new mongoose.Types.ObjectId(session.user.id);
		
		const { title, priority, collectionId } = await req.json();
		await connectToDatabase();
		if (!collectionId) NextResponse.json({ error: "collectionId is required" }, { status: 400 })
		
		if (!title || typeof title !== "string") NextResponse.json({ error: "Title is required" }, { status: 400 });
		
		const collection = await Collection.findOne({
			_id: collectionId,
			userId: session.user.id,
		});

		if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
		

		const list = await TodoList.create({
			title: title,
			slug: toSlug(title),
			userId: userId,
			tasks: [],
			dateCreated: new Date().toISOString(),
			priority,
			collectionId,
		});

		await Collection.updateOne(
			{ _id: collection._id },
			{ $push: { todoLists: list._id } }
		);
		
		return NextResponse.json(list, { status: 201 });

	} catch (err) {
		console.error(err);
	};
};

export async function PATCH(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json( {error: "Unauthorized" }, { status: 401 });

		const { taskListId, newTitle } = await req.json();

		const userId = new mongoose.Types.ObjectId(session.user.id);

		const updatedList = await TodoList.findOneAndUpdate(
			{ _id: taskListId, userId: userId },
			{ $set: { slug: toSlug(newTitle), title: newTitle }},
			{ new: true },
		);

		if (!updatedList) return NextResponse.json( {message: "list or user not found"}, { status: 404} );

		return NextResponse.json( {
			message: "Title updated successfully",
			updatedList,
		}, { status: 200 } );

	} catch (err) {
		console.error("Error with updating the list name", err);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	};
};
