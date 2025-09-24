import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TodoList from "@/models/TodoList";
import { NextRequest, NextResponse } from "next/server";
import { toSlug } from "@/app/utilities";
import mongoose from "mongoose";

export async function GET() {

	try {
		const session = await getServerSession( authOptions );
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		await connectToDatabase();

		const lists = await TodoList.find({
			userId: new mongoose.Types.ObjectId(session.user.id),
		});

		return NextResponse.json(lists, { status: 200 });
		
	} catch (err) {
		console.error( "GET /api/todo-lists error", err );
	}

};

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		
		const { title } = await req.json();
		
		if (!title || typeof title !== "string") NextResponse.json({ error: "Title is required" }, { status: 400 });
		
		await connectToDatabase();
		
  		const userId = new mongoose.Types.ObjectId(session.user.id);

		const list = new TodoList({
			title: title,
			slug: toSlug(title),
			userId: userId,
			tasks: [],
			dateCreated: new Date().toISOString(),
		});

		await list.save();

		return NextResponse.json(
			{ 
				id: list._id.toString(), 
				slug: list.slug 
			},
			{ status: 201 }
		);

	} catch (err) {
		console.error(err);
	}
};
