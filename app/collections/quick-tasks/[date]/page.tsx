"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { PageHeader, Loader } from "@/app/components";
import Link from "next/link";

interface QuickTask {
  _id: string;
  text: string;
  completed: boolean;
  dateCompleted: string | null;
  dueDate?: string | null;
  order: number;
  movedAt?: string | null;
  archived?: boolean;
}

export default function QuickTasksDay() {
  const { status } = useSession();
  const params = useParams<{ date: string }>();
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [showArchived, setShowArchived] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");

  if (status === "unauthenticated") redirect("/");

  const fetchTasksForDate = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/quick?date=${params.date}`);
      if (!res.ok) return;

      const data = await res.json();
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching quick tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [params.date]);

  useEffect(() => {
    fetchTasksForDate();
  }, [fetchTasksForDate]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const res = await fetch("/api/tasks/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newTaskText,
          date: params.date,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setNewTaskText("");
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task");
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/quick/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, completed: !completed } : t
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/quick/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const formattedDate = new Date(`${params.date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
      <PageHeader title={`Quick Tasks - ${formattedDate}`} />

      {loading ? (
        <Loader />
      ) : (
        <div className="w-[90%] lg:w-2/3 flex-grow flex flex-col gap-4 py-4">
          {/* Create task form */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add quick task..."
              className="flex-1 bg-mono-700 border border-mono-600 rounded px-3 py-2 text-white placeholder-mono-400 focus:outline-none focus:border-mint-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-mint-500 hover:bg-mint-600 rounded text-white font-semibold"
            >
              Add
            </button>
          </form>

          {/* Task list */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-mono-300">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="mr-2"
              />
              Show archived
            </label>
          </div>

          {tasks.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-mono-400">
              No quick tasks for this day
            </div>
          ) : (
            <ul className="space-y-2 overflow-y-auto touch-pan-y scrollbar-soft">
              {tasks
                .filter((t) => (showArchived ? true : !t.archived))
                .map((task) => (
                  <li
                    key={task._id}
                    className="flex items-center gap-3 bg-mono-700 p-3 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task._id, task.completed)}
                      className="cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${
                        task.completed ? "line-through text-mono-400" : ""
                      }`}
                    >
                      {task.text}
                    </span>
                    {task.archived && (
                      <span className="text-xs text-mono-300 bg-mono-600 px-2 py-1 rounded mr-2">archived</span>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="px-2 py-1 text-sm text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
            </ul>
          )}

          <Link
            href="/collections/quick-tasks"
            className="mt-auto text-center text-mono-400 hover:text-mono-300 py-2"
          >
            ← Back to Quick Tasks
          </Link>
        </div>
      )}
    </section>
  );
}
