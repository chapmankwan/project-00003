import { type Task } from "@/models/interfaces";

type Priority = string;

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  minor: 1,
  moderate: 2,
  major: 3,
};

export const getCompletionProgress = (tasks: Task[]) => {
    if (!tasks || !tasks.length) {
        return {
            percent: 0,
            completed: 0,
            total: 0,
        };
    };

    // Weighted completed tasks
     const completed = tasks
        .filter(t => t.completed)
        .reduce(
            (sum, t) => sum + PRIORITY_WEIGHTS[t.priority ?? "moderate"],
            0
        );

    // Weighted total tasks
    const total = tasks.reduce(
        (sum, t) => sum + PRIORITY_WEIGHTS[t.priority ?? "moderate"],
        0
    );

    return {
        percent: Math.round( (completed / total) * 100),
        completed,
        total,
    };
};