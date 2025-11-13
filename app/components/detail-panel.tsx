"use client"
import { useEffect, useState } from "react";

import { Task } from "@/models";

import { Select } from '@headlessui/react'
import { TrashIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import { Types } from "mongoose";

interface DetailPanelModel {
    deleteTask: (taskId: Types.ObjectId) => void;
    task: Task;
    onClose: () => void;
};

export const DetailPanel =({
    deleteTask,
    task,
    onClose,
}: DetailPanelModel) => {
    const [isVisible, setIsVisible] = useState(false);

    // console.log("+++ DetailedPanel - task", task);
    
    useEffect(() => {
        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        // Animate out first, then unmount
        setIsVisible(false);
        setTimeout(onClose, 300); // match transition duration
    };

    const handleDeleteTask = () => {
        deleteTask(task._id);
        handleClose();
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
                "absolute bottom-0 left-0 right-0 z-50 bg-slate-800 text-mint-300 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-300 ease-out h-[50dvh] overflow-y-auto",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-mint-500/20">
                    <h2 className="text-lg font-semibold">Task Details</h2>
                    <button onClick={handleClose} className="cursor-pointer text-mint-400 hover:text-mint-200">
                        close
                    </button>
                </div>

                <div className="flex flex-col p-4 h-[calc(50dvh-61px)] overflow-y-auto">
                    <p>Date created: {task.date}</p>
                    <p>Completed: {task.completed ? "Finished" : "Not yet complete"}</p>
                    <div className="flex gap-2">
                        <p>Urgency:</p>
                        <Select name="urgency" aria-label="task urgency" className="border cursor-pointer data-focus:bg-blue-500 data-hover:shadow">
                            <option value="minor">minor</option>
                            <option value="moderate">moderate</option>
                            <option value="major">major</option>
                        </Select>
                    </div>
                    {task.edited ? "edited" : ""}
                    <ul className="">
                        <p className="font-bold">Subtasks: </p>
                        <li className="flex gap-2 cursor-pointer hover:bg-slate-600 border border-solid border-slate-400 px-2 py-1">
                            <input type="checkbox"/>
                            <span>subtask a</span>
                        </li>
                        <li className="flex gap-2 cursor-pointer hover:bg-slate-600 bg-slate-800 border border-solid border-slate-400 px-2 py-1 border-t-0">
                            <input type="checkbox"/>
                            <span>subtask a</span>
                        </li>
                        <li className="flex gap-2 cursor-pointer hover:bg-slate-600 bg-slate-800 border border-solid border-slate-400 px-2 py-1 border-t-0">
                            <input type="checkbox"/>
                            <span>subtask a</span>
                        </li>
                        <li className="flex gap-2 cursor-pointer hover:bg-slate-600 bg-slate-800 border border-solid border-slate-400 px-2 py-1 border-t-0">
                            <input type="checkbox"/>
                            <span>subtask a</span>
                        </li>
                        <li className="flex gap-2 cursor-pointer hover:bg-slate-600 bg-slate-800 border border-solid border-slate-400 px-2 py-1 border-t-0">
                            <input type="checkbox"/>
                            <span>subtask a</span>
                        </li>
                        <li className="flex gap-2 cursor-pointer hover:bg-slate-600 bg-slate-800 border border-solid border-slate-400 px-2 py-1 border-t-0">
                            <input type="checkbox"/>
                            <span>subtask a</span>
                        </li>
                    </ul>
                    <button 
                        className="absolute right-4 flex items-center w-fit cursor-pointer hover:text-red-600 rounded p-2 mt-auto ml-auto"
                        onClick={handleDeleteTask}
                    >
                        <TrashIcon className="size-6"/>
                    </button>
                </div>
            </div>
        </section>
    );
}
