import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { HydratedDocument } from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import { Collection } from "@/models";

import { Collection as CollectionType} from "@/models/interfaces";

type CollectionDoc = HydratedDocument<CollectionType>;

export async function PATCH(
    req: NextRequest,
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderedIds } = await req.json();
        await connectToDatabase();

        const collections: CollectionDoc[] = await Collection.find({
            userId: session.user.id,
        });

        if (!collections) {
            return NextResponse.json({ error: "List not found" }, { status: 404 });
        }

        collections.forEach((collection) => {
            collection.order = orderedIds.indexOf(collection._id.toString());
        });
        collections.sort((a, b) => a.order - b.order);
        await Promise.all(collections.map((collection) => collection.save()));

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Error reordering tasks:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}