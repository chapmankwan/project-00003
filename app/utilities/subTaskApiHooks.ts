"use client";
import { useCallback } from "react";
import { Types } from "mongoose";

export const useSubTaskApi = (listId: string, taskId: Types.ObjectId) => {

    const saveSubTask = async (update: object) => {
        try {
            const response = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}/subtasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(update)
            });
    
            if (!response.ok) throw new Error(`Failed to save subtask: ${response.statusText}`);
    
            const data = await response.json();

            console.log("+++ data in saveSubTask", data);
            
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
            const response = await fetch(
                `/api/todo-lists/${listId}/tasks/${taskId}/subtasks/${subTaskId}`, 
                { method: "DELETE" });

            if (!response.ok) throw new Error("Failed to delete task");

            return response.json();
        } catch (err) {
            console.error("Error deleting the subtask", err)
            throw err;
        }
    };

//     async function deleteSubTask(id: string) {
//   await fetch(`/api/subtasks/${id}`, { method: "DELETE" });
//   setSubTasks(prev => prev.filter(st => st._id !== id));
// }

    // const getSubTasks = async () => {
    //     try {
    //         const res = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}/subtasks`);

    //         if (!res.ok) throw new Error("Failed to get subtasks");

    //         const subTaskList = await res.json();

    //         return {
    //             subTaskList,
    //             subTasksLoading: false,
    //         }

    //     } catch (err) {
    //         console.error("There was an error loading the tasks, check logs", err);
    //     }
    // };
    
    const getSubTasks = useCallback(async () => {
        const res = await fetch(
            `/api/todo-lists/${listId}/tasks/${taskId}/subtasks`
        );
        if (!res.ok) return null;

        const subTaskList = await res.json();

        return {
            subTaskList,
            subTasksLoading: false,
        }
    }, [listId, taskId]);
    
    return {
        deleteSubTask,
        getSubTasks,
        saveSubTask,
        updateSubTask,
    };
};