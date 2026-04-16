import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/services/account.service";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, username } = body;

    if (displayName === undefined && username === undefined) {
      return NextResponse.json(
        { error: "No fields provided." },
        { status: 400 }
      );
    }

    const result = await updateProfile(session.user.id, { displayName, username });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in PATCH /api/account/profile:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}