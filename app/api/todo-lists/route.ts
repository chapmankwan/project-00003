import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TodoList from "@/models/TodoList";
import { NextResponse } from "next/server";
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

export async function POST() {
  
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const today = new Date().toISOString().split("T")[0];

  		const userId = new mongoose.Types.ObjectId(session.user.id);

		let list = await TodoList.findOne({ slug: today, userId });

		if (!list) {
			list = new TodoList({
				title: today,
				slug: toSlug(today),
				userId: userId,
				tasks: [],
				dateCreated: new Date().toISOString(),
			});
			await list.save();
		}

		return NextResponse.json({
			id: list._id.toString(),
			slug: list.slug,
		});

	} catch (err) {
		console.error(err);
	}
};
