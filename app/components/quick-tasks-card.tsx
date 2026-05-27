"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { QuickTask } from "@/lib/services/today.service";

interface QuickTasksCardProps {
  listId: string;
  initialTasks: QuickTask[];
}

export function QuickTasksCard({ listId, initialTasks }: QuickTasksCardProps) {
  const [tasks, setTasks] = useState<QuickTask[]>(initialTasks);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputOpen) inputRef.current?.focus();
  }, [inputOpen]);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  async function handleAdd() {
    const text = inputValue.trim();
    if (!text) return;

    setAdding(true);
    try {
      const res = await fetch("/api/tasks/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, text }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      const task: QuickTask = await res.json();
      setTasks(prev => [...prev, task]);
      setInputValue("");
      setInputOpen(false);
    } catch {
      toast.error("Failed to add task", {
        action: { label: "Retry", onClick: handleAdd },
      });
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(task: QuickTask) {
    const newCompleted = !task.completed;

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t._id === task._id
          ? { ...t, completed: newCompleted, dateCompleted: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/today/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setTasks(prev =>
        prev.map(t =>
          t._id === task._id ? { ...t, completed: task.completed, dateCompleted: task.dateCompleted } : t
        )
      );
      toast.error("Failed to update task");
    }
  }

  async function handleDelete(task: QuickTask) {
    // Optimistic update
    setTasks(prev => prev.filter(t => t._id !== task._id));

    try {
      const res = await fetch(`/api/tasks/today/${task._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      });

      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setTasks(prev => [...prev, task].sort((a, b) => a.order - b.order));
      toast.error("Failed to delete task");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setInputOpen(false);
      setInputValue("");
    }
  }

  return (
    <div className="rounded-xl bg-mono-700 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-pale-300">
          Quick Tasks
        </p>
        <span className="text-xs text-pale-500/70">
          {incompleteTasks.length} remaining
        </span>
      </div>

      {/* Add input */}
      {inputOpen ? (
        <div className="flex items-center gap-2 mt-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task name..."
            className="flex-1 text-sm bg-transparent border-b border-mono-400 outline-none py-1 text-mono-800 dark:text-mono-100 placeholder:text-mono-400"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !inputValue.trim()}
            className="text-xs text-mint-500 hover:underline underline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {adding ? "Adding..." : "Add"}
          </button>
          <button
            onClick={() => { setInputOpen(false); setInputValue(""); }}
            className="text-xs text-blush-700/75 hover:underline underline-offset-2 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setInputOpen(true)}
          className="text-xs text-mono-400 hover:text-mono-200 text-left cursor-pointer transition-colors"
        >
          + Add task
        </button>
      )}

      {/* Incomplete tasks */}
      {incompleteTasks.length > 0 && (
        <ul className="flex flex-col gap-1">
          {incompleteTasks.map(task => (
            <TaskRow
              key={task._id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {/* Empty state — only when no incomplete tasks and input not open */}
      {incompleteTasks.length === 0 && !inputOpen && (
        <p className="text-sm text-mono-400 dark:text-mono-500">
          No tasks for today yet.
        </p>
      )}

      

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <>
          <div className="border-t border-mono-100 dark:border-mono-800 pt-3 mt-1">
            <p className="text-xs text-mono-400 dark:text-mono-500 mb-2">Completed</p>
            <ul className="flex flex-col gap-1">
              {completedTasks.map(task => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

interface TaskRowProps {
  task: QuickTask;
  onToggle: (task: QuickTask) => void;
  onDelete: (task: QuickTask) => void;
}

function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  return (
    <li className="flex items-center gap-2 group">
      <button
        onClick={() => onToggle(task)}
        className={`
          w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer
          ${task.completed
            ? "bg-mono-600 border-mono-100"
            : "border-mono-400 dark:hover:border-mono-300"
          }
        `}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white fill-black cursor-pointer" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span className={`flex-1 text-sm cursor-pointer text-mono-300 hover:text-mono-200 ${task.completed ? "line-through" : ""}`}>
        {task.text}
      </span>

      <button
        onClick={() => onDelete(task)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-mono-300 hover:text-mono-200 cursor-pointer"
        aria-label="Delete task"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}