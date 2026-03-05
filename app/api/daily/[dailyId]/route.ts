import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import { DailyTaskTemplate } from "@/models";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// This is only used to hard remove an item from the database
export async function DELETE (
    req: NextRequest,
	context: { params: Promise<{ dailyId: string; }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json( {error: "Unauthorized"}, {status: 401});

        const { dailyId } = await context.params;

        if (!dailyId) return NextResponse.json( {error: "dailyId not provided"}, {status: 401});

        await connectToDatabase();

        const deleteDailyTask = await DailyTaskTemplate.findOneAndDelete({
            _id: dailyId,
            userId: session.user.id,
        });

        if (!deleteDailyTask) return NextResponse.json({message: "Daily task not found"}, {status: 404});

    } catch (err) {
        console.error( "Error in DELETE for daily/[dailyId]", err);
        NextResponse.json( {message: "Interal Server Error"}, {status: 500});
    };
};

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ dailyId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { dailyId } = await context.params;

        await connectToDatabase();

        const body = await req.json();

        const updated = await DailyTaskTemplate.findOneAndUpdate(
        { _id: dailyId, userId: session.user.id },
        { $set: body },
        { new: true }
        );

        if (!updated) return NextResponse.json({message: "Daily task not found"}, { status: 404 });

        return NextResponse.json(updated, { status: 200 });

    } catch (err) {
        console.error("Error updating daily task:", err);
        return NextResponse.json({message: "Internal Server Error"}, { status: 500 });
    };
};
