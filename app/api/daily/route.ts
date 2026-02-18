import "@/models";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";
import { getUTCStartOfDayPT } from "@/lib/date";

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
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        // this shouldn't really ever be undefined
        const dayUTC = getUTCStartOfDayPT(dateParam || undefined);

        // 1. Find existing daily
        let daily = await Daily.findOne({
            userId: session.user.id,
            date: dayUTC,
        }).populate("tasks");

        if (daily) {
            return NextResponse.json(daily, { status: 200 });
        }

        // 2. If not found → generate from templates
        const templates = await DailyTaskTemplate.find({
            userId: session.user.id,
        });

        const createdTasks = await DailyTask.insertMany(
            templates.map((template) => ({
                userId: session.user.id,
                templateId: template._id,
                title: template.title,
                date: dayUTC,
                completed: false,
            }))
        );

        daily = await Daily.create({
            userId: session.user.id,
            date: dayUTC,
            tasks: createdTasks.map((t) => t._id),
        });

        daily = await daily.populate("tasks");

        return NextResponse.json(daily, { status: 201 });
    } catch (err) {
        console.error("Error fetching daily:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// export async function POST (req: NextRequest) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
//         await connectToDatabase();

//         const body = await req.json();
//         if (!body.text.trim()) return NextResponse.json( {message: "Text is required"}, {status: 400} );

//         const dailyTask = await DailyTaskTemplate.create({
//             userId: session.user.id,
//             text: body.text.trim(),
//             description: body.description || "",
//             priority: body.priority ?? 0,
//             isActive: true,
//         });

//         return NextResponse.json(dailyTask, { status: 201 });

//     } catch (err) {
//         console.error( "Error creating a new daily task template", err ); 
//         return new NextResponse( "Internal Server Error", { status: 500 })
//     };
// };

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