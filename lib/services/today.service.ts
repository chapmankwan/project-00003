import { connectToDatabase } from "@/lib/mongodb";
import { Task, TodoList, Collection } from "@/models";
import { getOrCreateSystemList } from "@/lib/services/todolist.service";
import type { Types } from "mongoose";
import type { TaskDoc } from "@/lib/types/models";

export interface QuickTask {
  _id: string;
  text: string;
  completed: boolean;
  dateCompleted: string | null;
  dueDate?: string | null;
  order: number;
  date?: string | null;
}

export interface TodayTasksResult {
  listId: string;
  tasks: QuickTask[];
}

// NOTE: Pruning of non-quick completed tasks has been moved to lib/services/cleanup.service.ts
// to avoid performing cleanup synchronously during request handling. Schedule the
// exported `pruneNonQuickCompletedTasks` function as a background job.

// Move completed quick-tasks (completed before today's local midnight) into per-date TodoLists
async function moveCompletedQuickTasksToPerDateLists(
  userId: string,
  listId: Types.ObjectId,
  localDateParam: string
): Promise<void> {
  const startOfToday = new Date(`${localDateParam}T00:00:00`);

  const completed = await Task.find({
    listId,
    type: "quick-task",
    completed: true,
    dateCompleted: { $lt: startOfToday },
  }).select("_id date dateCompleted");

  if (!completed || completed.length === 0) return;

  // Group by target date slug (YYYY-MM-DD)
  const groups: Record<string, string[]> = {};
  for (const t of completed) {
    const anchor = t.date || t.dateCompleted;
    const slug = anchor ? new Date(anchor).toISOString().split("T")[0] : localDateParam;
    groups[slug] = groups[slug] || [];
    groups[slug].push(t._id.toString());
  }

  // Ensure Quick Tasks collection exists for the user
  let quickCollection = await Collection.findOne({ userId, name: "Quick Tasks" });
  if (!quickCollection) {
    const order = await Collection.countDocuments({ userId });
    quickCollection = await Collection.create({ name: "Quick Tasks", userId, todolists: [], dateCreated: new Date(), order });
  }

  // For each date group, find or create the TodoList and move tasks
  for (const [slug, ids] of Object.entries(groups)) {
    // find existing list
    let target = await TodoList.findOne({ collectionId: quickCollection._id, userId, slug });
    if (!target) {
      target = await TodoList.create({
        userId,
        collectionId: quickCollection._id,
        title: slug,
        slug,
        tasks: [],
      });
    }

    // Move tasks: set listId to target, mark movedAt and archived
    const movedAt = new Date();
    await Task.updateMany(
      { _id: { $in: ids } },
      { $set: { listId: target._id, movedAt, archived: true } }
    );
    await TodoList.updateOne({ _id: target._id }, { $push: { tasks: { $each: ids } } });

    // Remove from the system today list
    await TodoList.updateOne({ _id: listId }, { $pull: { tasks: { $in: ids } } });
  }
}

export async function getTodayTasks(
  userId: string,
  localDateParam: string
): Promise<TodayTasksResult> {
  await connectToDatabase();

  const list = await getOrCreateSystemList(userId, "today") as { _id: Types.ObjectId };
  const listId = list._id;

  // Move completed quick-tasks to per-date lists (preserve history), then prune other completed tasks
  await moveCompletedQuickTasksToPerDateLists(userId, listId, localDateParam);

  const tasks = await Task.find({ listId, userId, type: "quick-task" })
    .select("text completed dateCompleted dueDate order")
    .sort({ order: 1 })
    .lean<TaskDoc[]>();

  return {
    listId: listId.toString(),
    tasks: tasks.map(t => ({
      _id: t._id.toString(),
      text: t.text,
      completed: t.completed,
      dateCompleted: t.dateCompleted ? t.dateCompleted.toISOString() : null,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      order: t.order,
    })),
  };
}

export async function createTodayTask(
  userId: string,
  listId: string,
  text: string,
  dueDate?: string
): Promise<QuickTask> {
  await connectToDatabase();

  const lastTask = await Task.findOne({ listId, userId })
    .sort({ order: -1 })
    .select("order")
    .lean<TaskDoc>();

  const nextOrder = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    userId,
    listId,
    text,
    completed: false,
    order: nextOrder,
    dueDate: dueDate ? new Date(dueDate) : null,
    // Record the date for quick-tasks so date-based queries can find them.
    // Use local-midnight so date-only queries match predictable local dates.
    date: (() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    })(),
    type: "quick-task",
  });

  await TodoList.updateOne(
    { _id: listId },
    { $push: { tasks: task._id } }
  );

  return {
    _id: task._id.toString(),
    text: task.text,
    completed: task.completed,
    dateCompleted: null,
    order: task.order,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    date: task.date ? task.date.toISOString() : null,
  };
}

export async function completeTodayTask(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  await connectToDatabase();

  await Task.updateOne(
    { _id: taskId, userId },
    {
      completed,
      dateCompleted: completed ? new Date() : null,
    }
  );
}

export async function deleteTodayTask(
  userId: string,
  taskId: string,
  listId: string
): Promise<void> {
  await connectToDatabase();

  await Promise.all([
    Task.deleteOne({ _id: taskId, userId }),
    TodoList.updateOne(
      { _id: listId },
      { $pull: { tasks: taskId } }
    ),
  ]);
}