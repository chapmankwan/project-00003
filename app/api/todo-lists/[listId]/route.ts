import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import TodoList from "@/models/TodoList";

import mongoose from "mongoose";

export async function GET( req: NextRequest ) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized"}, { status: 401});
        
        await connectToDatabase();

        const url = new URL(req.url);
        const listId = url.pathname.split("/").pop();

        const list = await TodoList.findOne({
            _id: listId,
            userId: session.user.id,
        });

        if (!list) return new NextResponse("List not found", {status: 404});

        return NextResponse.json(list, { status: 200 });

    } catch (err) {
        console.error("Error fetching list:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    };
};

export async function DELETE(
	_: NextRequest, 
	context: { params: Promise<{listId: string}>},
) {
	
	try {

		const { listId } = await context.params;
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!mongoose.Types.ObjectId.isValid(listId)) return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
    	if (!mongoose.Types.ObjectId.isValid(session.user.id)) return NextResponse.json({ error: "Invalid user ID in session" }, { status: 400 });

		await connectToDatabase();

        console.log("+++ listId", listId);

		const result = await TodoList.findOneAndDelete({
			_id: new mongoose.Types.ObjectId(listId),
			userId: new mongoose.Types.ObjectId(session.user.id),
		});

        console.log("+++ result", result);

		if (!result) return NextResponse.json({ error: "List not found" }, { status: 404 });

		return NextResponse.json(
			{ message: "List deleted successfully", listId },
			{ status: 200 }
		);
		
	} catch (err) {
		console.error("Delete list error", err);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
