import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json( {error: "Unauthorized" }, { status: 401 });

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
            recurrence,
        } = await req.json();

        if (!text?.trim()) return NextResponse.json( {message: "Text is required"}, {status: 400} );
        if (!recurrence?.trim()) return NextResponse.json( {message: "Recurrence is required"}, {status:402}) ;

        const lastTemplate = await DailyTaskTemplate.findOne({
            userId: session.user.id,
        }).sort({ order: -1 })

        // use database order
        const nextOrder = lastTemplate ? lastTemplate.order + 1 : order;

        const dailyTaskTemplate = await DailyTaskTemplate.create({
            userId: session.user.id,
            text,
            description,
            order: nextOrder,
            isActive,
            priority: priority ?? "moderate",
            recurrence: recurrence ?? "FREQ=DAILY"
        });

        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        const existingDailyList = await Daily.findOne({
            userId: session.user.id,
            date: todayUTC,
        });

        if (existingDailyList) {
            const newDailyTask = await DailyTask.create(
                {
                    userId: session.user.id,
                    dailyId: existingDailyList._id,
                    templateId: dailyTaskTemplate._id,
                    text: dailyTaskTemplate.text,
                    description: dailyTaskTemplate.description,
                    priority: dailyTaskTemplate.priority,
                    completed: false,
                    order: nextOrder,
                    recurrence: dailyTaskTemplate.recurrence,
                }
            );

            existingDailyList.tasks.push(newDailyTask._id);
            await existingDailyList.save();
        };

        return NextResponse.json(dailyTaskTemplate, { status: 201 });
        
    } catch (err) {
        console.error( "Error with the task api", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    };
};