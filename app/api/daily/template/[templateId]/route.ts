import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Daily, DailyTask, DailyTaskTemplate } from "@/models";

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{templateId: Types.ObjectId}>}
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { templateId } = await context.params;

        if (!Types.ObjectId.isValid(templateId)) return NextResponse.json( {message: "Invalid template id"}, { status: 400 });

        await connectToDatabase();

        const body = await req.json();

        const updates: Record<string, boolean> = {};
        // Explicit allowlist
        if (typeof body.text === "string") updates.text = body.text;
        if (typeof body.description === "string") updates.description = body.description;
        if (typeof body.priority === "string") updates.priority = body.priority;
        if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
        if (typeof body.recurrence === "string") updates.recurrence = body.reccurence;

        const patchedDailyTaskTemplate = await DailyTaskTemplate.findOneAndUpdate(
            {
                _id: templateId,
                userId: session.user.id
            },
            {
                $set: updates,
            },
            { new : true },
        );

        if (!patchedDailyTaskTemplate) return NextResponse.json({ error: "Daily Task Template not found" }, { status: 404 });

        // Update items that are in current lists?
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        const existingDaily = await Daily.findOne({
            userId: session.user.id,
            date: todayUTC,
        });

        
        if (existingDaily) {
            await Daily.findOneAndUpdate(
                {
                    userId: session.user.id,
                    templateId: templateId,
                },
                {
                    $set: updates
                }
            );

            await existingDaily.save();
        };

        return NextResponse.json(patchedDailyTaskTemplate, {status: 200});

    } catch (err) {
        console.error(`Error with updating the task template PATCH`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ templateId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { templateId } = await context.params;

        if (!Types.ObjectId.isValid(templateId)) {
            return NextResponse.json(
                { message: "Invalid template id" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        try {
            const deletedTemplate = await DailyTaskTemplate.findOneAndDelete(
                {
                    _id: templateId,
                    userId: session.user.id,
                },
            );

            if (!deletedTemplate) {
                return NextResponse.json(
                    { error: "Template not found" },
                    { status: 404 }
                );
            }


            const executionTasks = await DailyTask.find(
                {
                    userId: session.user.id,
                    templateId: templateId,
                },
                { _id: 1, dailyId: 1 }
            )

            const executionIds = executionTasks.map((t) => t._id);

            await DailyTask.deleteMany({_id: { $in: executionIds }});

            await Daily.updateMany(
                {
                    userId: session.user.id,
                },
                {
                    $pull: { tasks: { $in: executionIds } },
                },
            );

            // Update the orders for remaining templates
            const deletedOrder = deletedTemplate.order;
            await DailyTaskTemplate.updateMany(
                {
                    userId: session.user.id,
                    order: { $gt: deletedOrder },
                },
                {
                    $inc: { order: -1 },
                },
            );

            return NextResponse.json(
                {
                    message: "Template deleted successfully",
                    deletedTemplateId: templateId,
                },
                { status: 200 }
            );
        } catch (err) {
            throw err;
        }
    } catch (err) {
        console.error("Error deleting template:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}