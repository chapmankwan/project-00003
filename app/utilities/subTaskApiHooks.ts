"use client";

import { Types } from "mongoose";

export const subTaskApiHooks = (listId: string, taskId: Types.ObjectId) => {

    const saveSubTask = async (update: object) => {
        try {
            const response = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}/subtasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(update)
            });
    
            if (!response.ok) throw new Error(`Failed to save subtask: ${response.statusText}`);
    
            const data = await response.json();
            
            return data;
        } catch (err) {
            console.error("Error saving subtask:", err)
            throw err;
        }
    };

    const updateSubTask = async (subTaskId: string, update: object) => {
        try {
            const response = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}/subtasks/${subTaskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...update,
                })
            });

            if (!response.ok) throw new Error("Failed to update task");

            return response.json();

        } catch (err) {
            console.error("Error updating subtask:", err);
            throw err;
        }
    };

    const deleteSubTask = async (subTaskId: string) => {
        try {
            const response = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}/subtasks/${subTaskId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subTaskId })
            });

            if (!response.ok) throw new Error("Failed to delete task");

            return response.json();
        } catch (err) {
            console.error("Error deleting the subtask", err)
            throw err;
        }
    }

    return {
        deleteSubTask,
        saveSubTask,
        updateSubTask,
    };
};