import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import { Collection } from "@/models";

import { Collection as CollectionType} from "@/models/interfaces";

export async function PATCH(
    req: NextRequest,
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderedIds } = await req.json();
        await connectToDatabase();

        const collections = await Collection.find({
            userId: session.user.id,
        });

        if (!collections) {
            return NextResponse.json({ error: "List not found" }, { status: 404 });
        }

        collections.forEach((collection: CollectionType) => {
            collection.order = orderedIds.indexOf(collection._id.toString());
        });
        collections.sort((a: CollectionType, b: CollectionType) => a.order - b.order);
        // collection comes from Mongoose and includes document methods like `save`.
        // Cast to any to satisfy TypeScript since CollectionType is a plain interface.
        // FIX THIS SHIT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await Promise.all(collections.map((collection: any) => collection.save()));

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Error reordering tasks:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}