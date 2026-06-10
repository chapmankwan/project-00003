import { connectToDatabase } from "@/lib/mongodb";
import { Task, TodoList } from "@/models";
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
}

export interface TodayTasksResult {
  listId: string;
  tasks: QuickTask[];
}

// Prune tasks completed before today (user's local date passed as YYYY-MM-DD)
async function pruneCompletedTasks(
  listId: Types.ObjectId,
  localDateParam: string
): Promise<void> {
  const startOfToday = new Date(`${localDateParam}T00:00:00.000Z`);

  const stale = await Task.find({
    listId,
    completed: true,
    dateCompleted: { $lt: startOfToday },
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

export async function getTodayTasks(
  userId: string,
  localDateParam: string
): Promise<TodayTasksResult> {
  await connectToDatabase();

  const list = await getOrCreateSystemList(userId, "today") as { _id: Types.ObjectId };
  const listId = list._id;

  await pruneCompletedTasks(listId, localDateParam);

  const tasks = await Task.find({ listId, userId })
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
    type: "normal",
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