import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { DailyTaskTemplate } from "@/models";

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json( {error: "Unauthroized" }, { status: 401 });

        await connectToDatabase();

        const allDailyTaskTemplates = await DailyTaskTemplate.find({
            userId: session.user.id
        });

        return NextResponse.json(allDailyTaskTemplates, {status: 201});

    } catch (err) {
        console.error("Error with the daily task template GET", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest, 
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { 
            text, 
            description, 
            order, 
            priority,
            isActive, 
        } = await req.json();

        const dailyTaskTemplate = await DailyTaskTemplate.create({
            userId: session.user.id,
            text,
            description,
            order,
            isActive,
            priority: priority ?? "moderate",
        });

        return NextResponse.json(dailyTaskTemplate, { status: 201 });
        
    } catch (err) {
        console.error( "Error with the task api", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    };
};