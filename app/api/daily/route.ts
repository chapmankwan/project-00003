import "@/models";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";
// import { getUTCStartOfDayPT } from "@/lib/date";

// export async function GET () {
//     try {
// 		const session = await getServerSession(authOptions);
//         if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
//         await connectToDatabase();

//         const dailyTasks = await DailyTaskTemplate.find({ userId: session.user.id })
//             .sort({ order: 1, createdAt: 1 })
//             .lean();

//         return NextResponse.json(dailyTasks, { status: 200 });

//     } catch (err) {
//         console.error( "Error fetching daily tasks", err );
//         return new NextResponse( "Internal Server Error", { status: 500 })
//     };
// };
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // temp fix with getUTCStartOfDayPT
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

        // 3️⃣ If not found → generate inside transaction
        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            // Get templates
            const templates = await DailyTaskTemplate.find({
                userId: session.user.id,
            })
                .sort({ order: 1 })
                .session(mongoSession);

            // Create Daily document
            const newDaily = await Daily.create(
                [
                    {
                        userId: session.user.id,
                        date: todayUTC,
                        tasks: [],
                    },
                ],
                { session: mongoSession }
            );

            const dailyDoc = newDaily[0];

            // Create DailyTask instances
            const dailyTasks = await DailyTask.insertMany(
                templates.map((template, index) => ({
                    userId: session.user.id,
                    dailyId: dailyDoc._id,
                    templateId: template._id,
                    title: template.title,
                    description: template.description,
                    priority: template.priority,
                    completed: false,
                    order: index,
                })),
                { session: mongoSession }
            );

            // Attach task IDs to Daily
            dailyDoc.tasks = dailyTasks.map((t) => t._id);
            await dailyDoc.save({ session: mongoSession });

            await mongoSession.commitTransaction();
            mongoSession.endSession();

            // Re-fetch populated
            const populatedDaily = await Daily.findById(dailyDoc._id).populate({
                path: "tasks",
                options: { sort: { order: 1 } },
            });

            return NextResponse.json(populatedDaily, { status: 200 });
        } catch (err) {
            await mongoSession.abortTransaction();
            mongoSession.endSession();
            throw err;
        }
    } catch (err) {
        console.error("Error in GET /api/daily:", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
};

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