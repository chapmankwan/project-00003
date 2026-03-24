import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Daily } from "@/models";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        // Anchor to the client's local date, same pattern as /api/daily
        const anchorUTC = dateParam
            ? new Date(`${dateParam}T00:00:00.000Z`)
            : (() => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; })();

        const thirtyDaysAgo = new Date(anchorUTC);
        thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29); // 29 + today = 30 days

        const dailies = await Daily.find(
            {
                userId: session.user.id,
                date: { $gte: thirtyDaysAgo, $lte: anchorUTC },
            },
            {
                date: 1,
                completedCount: 1,
                totalCount: 1,
                _id: 0,
            }
        ).sort({ date: 1 });

        return NextResponse.json(dailies, { status: 200 });

    } catch (err) {
        console.error("Error fetching heatmap data:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};