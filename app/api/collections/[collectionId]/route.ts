import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Collection from "@/models/Collection";

import mongoose from "mongoose";

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

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{collectionId: string}>}
) {
    try {
        await connectToDatabase();

        const body = req.json();
        const { collectionId } = await context.params;

        const updatedCollection = await Collection.findByIdAndUpdate(
            collectionId,
            { $set: body },
            { new: true},
        );

        if (!updatedCollection) return NextResponse.json( {message: "Collection not found"}, {status: 404} );

        return NextResponse.json(updatedCollection, { status: 200 });

    } catch (err) {
        console.error("PATCH /api/collections/[collectionId] error patching the collection", err);
        return NextResponse.json( {message: "Internal Server Error"}, { status: 500 });
    };
};

export async function DELETE(
    _: NextRequest,
    context: { params: Promise<{collectionId: string}>}
) {
    try {
        const { collectionId } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!mongoose.Types.ObjectId.isValid(collectionId)) return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
        if (!mongoose.Types.ObjectId.isValid(session.user.id)) return NextResponse.json({ error: "Invalid user ID in session" }, { status: 400 });

        await connectToDatabase();

        const result = await Collection.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(collectionId),
            userId: new mongoose.Types.ObjectId(session.user.id),
        });

        if (!result) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

        return NextResponse.json(
            { message: "Collection deleted successfully", collectionId },
            { status: 200 },
        );

    } catch (err) {
        console.error("Delete collection error", err);
        return NextResponse.json({ message: "Internal Server Error"}, { status: 500 });
    };
};