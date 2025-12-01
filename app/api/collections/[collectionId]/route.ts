import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Collection from "@/models/Collection";

export async function GET( req: NextRequest ) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized"}, { status: 401});

        await connectToDatabase();

        const url = new URL(req.url);
        const collectionId = url.pathname.split("/").pop();

        const collection = await Collection.findOne({
            _id: collectionId,
            userId: session.user.id,
        });

        if (!collection) return new NextResponse("Collection not found", { status: 404 });
        
        return NextResponse.json(collection, { status: 200 });
    } catch (err) {
        console.error(" GET /api/collections/[collectionId] error fetching list", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    };
};