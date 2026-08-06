import "@/models";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Daily } from "@/models";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { date, note } = body;
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const normalizedDate = new Date(`${date}T00:00:00.000Z`);

    const daily = await Daily.findOneAndUpdate(
      {
        userId: session.user.id,
        date: normalizedDate,
      },
      {
        $set: {
          isHoliday: true,
          holidayNote: note ?? "",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(daily, { status: 200 });
  } catch (err) {
    console.error("Error in POST /api/daily/holiday:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const normalizedDate = new Date(`${date}T00:00:00.000Z`);

    const daily = await Daily.findOneAndUpdate(
      { userId: session.user.id, date: normalizedDate },
      { $set: { isHoliday: false, holidayNote: "" } },
      { new: true }
    );

    if (!daily) {
      return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
    }

    return NextResponse.json(daily, { status: 200 });
  } catch (err) {
    console.error("Error in DELETE /api/daily/holiday:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
