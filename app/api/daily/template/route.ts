import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";

import { NextRequest, NextResponse } from "next/server";
// import { getUTCStartOfDayPT } from "@/lib/date";

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

        if (!text?.trim()) return NextResponse.json( {error: "Text is required"}, {status: 400});

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
        });
        
        // insert into Dailies (list) - using DailyTask to copy the template if Dailies exist

        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        const existingDaily = await Daily.findOne({
            userId: session.user.id,
            date: todayUTC,
        });

        if (existingDaily) {
            const newDailyTask = await DailyTask.create(
                {
                    userId: session.user.id,
                    dailyId: existingDaily._id,
                    templateId: dailyTaskTemplate._id,
                    text: dailyTaskTemplate.text,
                    description: dailyTaskTemplate.description,
                    priority: dailyTaskTemplate.priority,
                    completed: false,
                    order: nextOrder,
                }
            );

            existingDaily.tasks.push(newDailyTask._id);
            await existingDaily.save();
            console.log("+++ existingDaily updated", existingDaily);
        };

        return NextResponse.json(dailyTaskTemplate, { status: 201 });
        
    } catch (err) {
        console.error( "Error with the task api", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    };
};