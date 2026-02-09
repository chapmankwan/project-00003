import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { Collection } from "@/models";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
    try {
        const session = await getServerSession( authOptions );
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        await connectToDatabase();

        const collections = await Collection.find({
            userId: new mongoose.Types.ObjectId(session.user.id)
        });

        return NextResponse.json(collections, { status: 200 });
    } catch (err) {
        console.error( "GET /api/collections error", err );
    }
};

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession( authOptions );
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, description } = await req.json();
        if (!name || typeof name !== "string") NextResponse.json({ error: "Collection name is required" }, { status: 400 });

        await connectToDatabase();

        const userId = new mongoose.Types.ObjectId(session.user.id);
        
        const collection = new Collection({
            name,
            description,
            userId,
            todolists: [],
            dateCreated: new Date().toISOString(),
        });

        await collection.save();

        return NextResponse.json(
            {
                _id: collection._id.toString(),
                name: collection.name
            },
            { status: 201 }
        );
    } catch (err) {
        console.error( "POST /api/collections error", err)
    };
};

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession( authOptions );
        if (!session?.user?.email) return NextResponse.json( {error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        
        const { id, newCollectionName } = await req.json();

        const userId = new mongoose.Types.ObjectId(session.user.id);

        const updatedCollection = await Collection.findOneAndUpdate(
            {_id: id.toString(), userId: userId },
            { $set: {name: newCollectionName} },
            { new: true },
        );

        if (!updatedCollection) return NextResponse.json( {message: "collection or user not found"}, {status: 404} );

        return NextResponse.json( {
            message: "Collection name updated successfully",
            updatedCollection,
        }, { status: 200 })
    } catch (err) {
        console.error("Error with updating the collection name", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    };
};