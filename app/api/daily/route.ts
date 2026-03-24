import "@/models";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { shouldIncludeTemplate } from "@/lib/date";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";

export async function GET(
    req: NextRequest,
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        const todayUTC = new Date(`${dateParam}T00:00:00.000Z`);

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

        const applicableTemplates = templates.filter(t =>
            shouldIncludeTemplate(t.recurrence ?? "FREQ=DAILY", todayUTC)
        );

        const newDaily = await Daily.create({
            userId: session.user.id,
            date: todayUTC,
            tasks: [],
            completedCount: 0,
            totalCount: 0,
        });

        try {
            const dailyTasks = await DailyTask.insertMany(
                templates.map((template, index) => ({
                    userId: session.user.id,
                    dailyId: newDaily._id,
                    templateId: template._id,
                    date: todayUTC,
                    text: template.text,
                    description: template.description,
                    priority: template.priority,
                    completed: false,
                    order: index,
                    recurrence: applicableTemplates,
                }))
            );
            
            // Temp and can be removed after - needed for previously generated dailies
            if (dailyList) {
                // Backfill if counts are missing
                if (dailyList.totalCount === 0 && dailyList.tasks.length > 0) {
                    const [completedCount, totalCount] = await Promise.all([
                        DailyTask.countDocuments({ dailyId: dailyList._id, completed: true }),
                        DailyTask.countDocuments({ dailyId: dailyList._id }),
                    ]);
                    dailyList.completedCount = completedCount;
                    dailyList.totalCount = totalCount;
                    await dailyList.save();
                }
                return NextResponse.json(dailyList, { status: 200 });
            }

            newDaily.tasks = dailyTasks.map((t) => t._id);
            await newDaily.save();
        } catch (err) {
            console.error("There was an issue inserting tasks", err);
            return NextResponse.json(
                {message: "Internal Server Error"},
                {status: 500}
            );
        }

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