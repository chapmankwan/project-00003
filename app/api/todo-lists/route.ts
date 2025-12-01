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

		let lists;
		if (!collectionId) {
			lists = await TodoList.find({
				userId: new mongoose.Types.ObjectId(session.user.id)
			})
		} else {
			// Temp so we are able to grab all the todolists in /workspaces
			lists = await TodoList.find({
				userId: new mongoose.Types.ObjectId(session.user.id),
				collectionId,
			});
		};

		return NextResponse.json(lists, { status: 200 });
		
	} catch (err) {
		console.error( "GET /api/todo-lists error", err );
		return new NextResponse("Internal Server Error", { status: 500 });
	}

};

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		
		const { title, priority, collectionId } = await req.json();
		
		if (!title || typeof title !== "string") NextResponse.json({ error: "Title is required" }, { status: 400 });
		
		await connectToDatabase();
		
  		const userId = new mongoose.Types.ObjectId(session.user.id);

		const list = new TodoList({
			title: title,
			slug: toSlug(title),
			userId: userId,
			tasks: [],
			dateCreated: new Date().toISOString(),
			priority,
			collectionId,
		});

		const updateCollection = await Collection.findByIdAndUpdate(
			collectionId,
			{ $push: { todoLists: list._id } },
			{ new: true },
		).populate("todoLists");

		await list.save();

		return NextResponse.json(
			{ 
				id: list._id.toString(), 
				slug: list.slug,
				collection: updateCollection,
			},
			{ status: 201 }
		);

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
