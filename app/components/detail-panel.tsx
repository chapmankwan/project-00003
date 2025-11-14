"use client"
import { ChangeEvent, useEffect, useState } from "react";

import { Task } from "@/models";

import { Select } from '@headlessui/react'
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    const [addingSubTask, setAddingSubTask] = useState(false);
    const [subTaskList, setSubTaskList] = useState([
        { _id: "temp1", text: "subtask a", completed: false },
        { _id: "temp2", text: "subtask b", completed: false },
        { _id: "temp3", text: "subtask c", completed: true },
        { _id: "temp4", text: "subtask d", completed: false },
        { _id: "temp5", text: "subtask e", completed: false },
        { _id: "temp6", text: "subtask f", completed: false },
        { _id: "temp7", text: "subtask g", completed: false },
        { _id: "temp8", text: "subtask h", completed: false },
        { _id: "temp9", text: "subtask i", completed: false },
        { _id: "temp10", text: "subtask j", completed: false },
        { _id: "temp11", text: "subtask k", completed: false },
        { _id: "temp12", text: "subtask l", completed: false },
        { _id: "temp13", text: "subtask m", completed: false },
        { _id: "temp14", text: "subtask n", completed: false },
        { _id: "temp15", text: "subtask o", completed: false },
    ]);
    
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


    const toggleSubTaskCompletion = (event: ChangeEvent<HTMLInputElement>) => {
        console.log("+++ toggled dat subtashk");
        console.log("+++ event", event);
        console.log("+++", setSubTaskList)
    }

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
                "absolute bottom-0 left-0 right-0 z-50 bg-slate-800 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-300 ease-out h-[75dvh]",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-mint-500/20">
                    <h2 className="text-lg font-semibold">Task Details</h2>
                    <button onClick={handleClose} className="cursor-pointer text-mint-400 hover:text-mint-200">
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <div className="flex flex-col p-4 h-[calc(750dvh-61px)]">
                    <p className="m-0 py-2">Date created: {task.date}</p>
                    <p className="m-0 py-2">Completed: {task.completed ? "Finished" : "Not yet complete"}</p>
                    <div className="flex gap-2 py-2 items-center">
                        <p>Urgency:</p>
                        <Select name="urgency" aria-label="task urgency" className="border cursor-pointer hover:bg-slate-600 data-focus:bg-blue-500 data-hover:shadow">
                            <option value="minor">minor</option>
                            <option value="moderate">moderate</option>
                            <option value="major">major</option>
                        </Select>
                    </div>
                    {/* {task.edited ? "edited" : ""} */}
                    <p className="m-0 py-2">Edited</p>
                    <div className="subtask container">
                        <ul className="">
                            <p className="">Subtasks: </p>
                            {
                                subTaskList.map( (subTask, index) => (
                                    <li 
                                        key={index}
                                        className={clsx("flex gap-2 cursor-pointer hover:bg-slate-600 border border-solid border-slate-400 px-2 py-1", index !== 0 && "border-t-0")}
                                    >
                                        <input 
                                            checked={subTask.completed}
                                            onChange={(event) => toggleSubTaskCompletion(event)}
                                            type="checkbox" 
                                        />
                                        <span>{subTask.text}</span>
                                    </li>
                                ))
                            }

                        </ul>

                        <div className="flex gap-2 py-2 items-center w-full">
                            {
                                !addingSubTask ?
                                <button className="p-1 cursor-pointer hover:bg-lavender-500 bg-lavender-600 rounded" onClick={() => setAddingSubTask(true)}>
                                    create subtask
                                </button>
                                :
                                <>
                                    <input 
                                        className="border rounded w-full"
                                        type="text"
                                    />
                                    <button className="cursor-pointer text-mint-500"><PlusIcon className="size-5"/></button>
                                    <button className="cursor-pointer text-red-500" onClick={() => setAddingSubTask(false)}><XMarkIcon className="size-5"/></button>
                                </>
                            }
                        </div>
                    </div>

                    {/* Close details panel button */}
                    <button 
                        className="absolute right-4 flex items-center w-fit border cursor-pointer text-red-400 hover:text-red-700 rounded p-1 mt-auto ml-auto"
                        onClick={handleDeleteTask}
                    >
                        <TrashIcon className="size-5"/>
                    </button>
                </div>
            </div>
        </section>
    );
}
