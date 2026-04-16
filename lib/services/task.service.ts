import { connectToDatabase } from "@/lib/mongodb";
import { Task } from "@/models";
import { TaskDoc } from "@/lib/types/models";
import { Types } from "mongoose";

export interface OverdueTask {
  _id: string;
  text: string;
  dueDate: string;
  priority: "minor" | "moderate" | "major";
  listId: {
    _id: string;
    name: string;
  } | null;
}

interface ListDocPopulated {
  _id: Types.ObjectId;
  name: string;
}

/**
 * Fetches incomplete tasks with a dueDate in the past.
 * Sorted by dueDate ascending (most overdue first).
 * Capped at 10 results for dashboard display.
 */
export async function getOverdueTasks(userId: string): Promise<OverdueTask[]> {
  await connectToDatabase();

  const tasks = await Task.find({
    userId,
    completed: false,
    dueDate: { $lt: new Date(), $ne: null },
  })
    .populate("listId", "name")
    .select("text dueDate priority listId")
    .sort({ dueDate: 1 })
    .limit(10)
    .lean<TaskDoc[]>();

  return tasks.map(t => {
    const listId = t.listId as ListDocPopulated | Types.ObjectId | null;
    const isPopulated = listId && "name" in listId;

    return {
      _id: t._id.toString(),
      text: t.text,
      dueDate: t.dueDate!.toISOString(),
      priority: t.priority,
      listId: isPopulated
        ? {
            _id: (listId as ListDocPopulated)._id.toString(),
            name: (listId as ListDocPopulated).name,
          }
        : null,
    };
  });
}