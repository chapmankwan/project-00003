"use client"
import { useEffect, useState } from "react";

import { Task } from "@/models/interfaces";

import { XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import { Types } from "mongoose";
import { DescriptionBox, PriorityBox, SubTasks, TaskTitle } from "@/app/components/details-panel/components";

interface DetailPanelModel {
    deleteTask: (taskId: Types.ObjectId) => void;
    task: Task;
    onClose: () => void;
    updateTask?: (payload: {
        text: string,
        priority: string,
        description?: string
    }) => Promise<void>;
    listId: string;
};

export const DetailsPanel =({
    deleteTask,
    task,
    onClose,
    updateTask,
    listId,
}: DetailPanelModel) => {

    const [isVisible, setIsVisible] = useState(false);
    const [taskTitle, setTaskTitle] = useState(task.text);
    const [descriptionInput, setDescriptionInput] = useState(task.description || "")


    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editTaskInput, setEditTaskInput] = useState("");

    const [selectedPriority, setSelectedPriority] = useState<string>(task.priority);

    useEffect(() => {
        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 10);

        return () => clearTimeout(timer);
        
    }, []);

    useEffect(() => {
        setEditTaskInput(task.text);
    }, [task])

    const handleClose = () => {
        // Animate out first, then unmount
        setIsVisible(false);
        setTimeout(onClose, 300); // match transition duration
    };

    const handleDeleteTask = () => {
        deleteTask(task._id);
        handleClose();
    };

    const handleEditTask = () => {
        let description;
        if (descriptionInput.length) {
            description = descriptionInput;
        }
        
        if (updateTask) updateTask({text: editTaskInput, priority: selectedPriority, description});
        setTaskTitle(editTaskInput);
        setIsEditingTask(false);
    };

    return (
        <section className="fixed inset-0 z-40">
        {/* Backdrop */}
            <div
                className={clsx(
                "absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Flyout Panel */}
            <div
                className={clsx(
                "absolute bottom-0 left-0 right-0 z-50 bg-mono-800 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-300 ease-out min-h-[50dvh] max-h-[75dvh]",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-mint-500/20">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <button onClick={handleClose} className="cursor-pointer text-mint-400 hover:text-mint-200">
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <div className="flex flex-col p-4 max-h-[calc(75dvh-61px)] overflow-y-auto">
                    <TaskTitle taskTitle={taskTitle} editTaskInput={editTaskInput} deleteTask={handleDeleteTask} isEditing={isEditingTask} setEditTaskInput={setEditTaskInput} setIsEditing={setIsEditingTask}/>

                    <p className="text-mint-400 text-xs">{task.edited ? "edited" : ""}</p>

                    <div className="flex">
                        <p className="font-bold">Date created: </p>
                        <p className="ml-1">{task.date.toString()}</p>
                    </div>

                    <div className="flex">
                        <p className="font-bold">Progress: </p>
                        <p className="ml-1">{task.completed ? "All work completed" : "In progress"}</p>
                    </div>

                    <DescriptionBox 
                        isEditing={isEditingTask} 
                        descriptionInput={descriptionInput}
                        setDescriptionInput={setDescriptionInput}
                        taskDescription={task.description || ""} 
                    />
                    <PriorityBox 
                        priority={task.priority} 
                        isEditing={isEditingTask} 
                        selectedPriority={selectedPriority} 
                        setSelectedPriority={setSelectedPriority}
                    />
                    <SubTasks taskId={task._id} listId={listId} />

                    {/* Bottom to save */}
                    {
                        isEditingTask ?
                        <div className="flex justify-end gap-1">
                            <button 
                                onClick={handleEditTask} 
                                className="flex items-center cursor-pointer rounded bg-mint-400 hover:bg-mint-500 px-2 py-1.5"
                            >
                                <span>Save</span>
                            </button>
                            <button 
                                onClick={() => setIsEditingTask(false) } 
                                className="flex items-center cursor-pointer rounded bg-red-500 hover:bg-red-400 px-2 py-1.5"
                            >
                                <span>Cancel</span>
                            </button>
                        </div>
                        :
                        null
                    }
                </div>
            </div>
        </section>
    );
}
