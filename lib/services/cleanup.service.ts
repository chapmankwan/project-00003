import { connectToDatabase } from "@/lib/mongodb";
import { Task, TodoList } from "@/models";
import type { Types } from "mongoose";

// Prune non-quick tasks completed before today (user's local date passed as YYYY-MM-DD)
export async function pruneNonQuickCompletedTasks(
  listId: Types.ObjectId,
  localDateParam: string
): Promise<void> {
  await connectToDatabase();

  const startOfToday = new Date(`${localDateParam}T00:00:00`);

  const stale = await Task.find({
    listId,
    completed: true,
    dateCompleted: { $lt: startOfToday },
    // Exclude quick-tasks from pruning
    type: { $ne: "quick-task" },
  }).select("_id");

  if (stale.length === 0) return;

  const staleIds = stale.map(t => t._id);

  await Promise.all([
    Task.deleteMany({ _id: { $in: staleIds } }),
    TodoList.updateOne(
      { _id: listId },
      { $pull: { tasks: { $in: staleIds } } }
    ),
  ]);
}
