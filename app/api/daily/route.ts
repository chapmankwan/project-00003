import "@/models";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        const dailyList = await Daily.findOne({
            userId: session.user.id,
            date: todayUTC,
        }).populate({
            path: "tasks",
            options: { sort: { order: 1 } },
        });

        if (dailyList) {
            return NextResponse.json(dailyList, { status: 200 });
        }

        // Not found — generate today's daily from templates
        const templates = await DailyTaskTemplate.find({
            userId: session.user.id,
        }).sort({ order: 1 });

        const newDaily = await Daily.create({
            userId: session.user.id,
            date: todayUTC,
            tasks: [],
        });

        const dailyTasks = await DailyTask.insertMany(
            templates.map((template, index) => ({
                userId: session.user.id,
                dailyId: newDaily._id,
                templateId: template._id,
                date: todayUTC,          // ← this was missing
                text: template.text,
                description: template.description,
                priority: template.priority,
                completed: false,
                order: index,
            }))
        );

        newDaily.tasks = dailyTasks.map((t) => t._id);
        await newDaily.save();

        const populatedDaily = await Daily.findById(newDaily._id).populate({
            path: "tasks",
            options: { sort: { order: 1 } },
        });

        return NextResponse.json(populatedDaily, { status: 200 });

    } catch (err) {
        console.error("Error in GET /api/daily:", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const body = await req.json();

        if (!body.title)
            return NextResponse.json(
                { error: "Title required" },
                { status: 400 }
            );

        const template = await DailyTaskTemplate.create({
            userId: session.user.id,
            title: body.title,
        });

        return NextResponse.json(template, { status: 201 });
    } catch (err) {
        console.error("Error creating template:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}