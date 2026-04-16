"use client";

import { Types } from "mongoose";

export const taskApiHooks = (listId: string) => {
    const api = `/api/todo-lists/${listId}/tasks`;

    const saveTask = async (text: string, priority: string, order: number, description?: string) => {
        try {
            const response = await fetch(api, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text, priority: priority, order: order, description: description, }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save task: ${response.statusText}`);
            }

            const data = await response.json();

            return data; // should contain the saved task with _id
        } catch (error) {
            console.error("Error saving task:", error);
            throw error;
        }
    };

    const deleteTask = async ( listId: string, taskId: Types.ObjectId ) => {
        const res = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId }),
        });

        if (!res) throw new Error("Failed to delete task");
        
        return res.json();
    };

    const updateTask = async (listId: string, taskId: Types.ObjectId, update: object, isDaily?: boolean) => {
        const endpoint = isDaily
            ? `/api/daily/tasks/${taskId}`
            : `/api/todo-lists/${listId}/tasks/${taskId}`;

        const res = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...update,
                edited: true,
            }),
        });

        if (!res.ok) throw new Error("Failed to update task");

        return res.json();
    };
    
    return { saveTask, deleteTask, updateTask };
};