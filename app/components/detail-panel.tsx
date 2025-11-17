"use client"
import { useEffect, useRef, useState } from "react";

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
    ]);
    const [subTaskInput, setSubTaskInput] = useState("");

    const subTaskInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (subTaskInputRef.current) {
            subTaskInputRef.current.scrollIntoView({ behavior: 'smooth'});
            subTaskInputRef.current.focus();
        }
    },[addingSubTask])

    const handleAddSubTask = () => {
        if (subTaskInput.length > 0) {
            const newSubTask = {
                _id: `temp${subTaskList.length}`,
                text: subTaskInput,
                completed: false,
            };

            setSubTaskList([...subTaskList, newSubTask]);
            // reset input after adding a subTask
            setSubTaskInput("");
        }
    }

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && subTaskInput.length > 0 ) {
            handleAddSubTask();
        };
    };
    
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

    const handleUpdateSubtask = (subTaskId: string) => {
        setSubTaskList( (prevList) => {
            return (
                prevList.map( subTask => {
                    return (
                        subTask._id === subTaskId ? {...subTask, completed: !subTask.completed} : subTask
                    )
                })
            )
        })
    };

    const handleRemoveSubTask = (event: React.MouseEvent<HTMLButtonElement>, subTaskId: string) => {
        event.stopPropagation();
        setSubTaskList(subTaskList.filter( subTask => subTask._id !== subTaskId));
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
                "absolute bottom-0 left-0 right-0 z-50 bg-slate-800 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-300 ease-out h-[75dvh] md:h-[50dvh]",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-mint-500/20">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <button onClick={handleClose} className="cursor-pointer text-mint-400 hover:text-mint-200">
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <div className="flex flex-col p-4 h-[calc(75dvh-61px)] md:h-[calc(50dvh-61px)] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <p className="m-0 pr-2 font-bold text-mint-500">Task: {task.text}</p>

                        {/* Close details panel button */}
                        <button 
                            className="flex items-center w-fit border-0 cursor-pointer text-slate-50 bg-red-500 hover:bg-red-700 rounded p-2 gap-2"
                            onClick={handleDeleteTask}
                            title="delete"
                        >
                            <TrashIcon className="size-5"/>
                        </button>
                    </div>
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
                    <div className="subtask container">
                        <ul className="overflow-y-visible">
                            <p className="">Subtasks: </p>
                            {
                                subTaskList.map( (subTask, index) => (
                                    <li 
                                        key={index}
                                        className={clsx("flex gap-2 cursor-pointer hover:bg-slate-600 border border-solid border-slate-400 px-2 py-1", index !== 0 && "border-t-0")}
                                        onClick={() => handleUpdateSubtask(subTask._id)}
                                    >
                                        <input 
                                            checked={subTask.completed}
                                            onChange={() => handleUpdateSubtask(subTask._id)}
                                            type="checkbox" 
                                        />
                                        <span>{subTask.text}</span>
                                        <button 
                                            onClick={(event) => handleRemoveSubTask(event, subTask._id)}
                                            className="ml-auto text-red-500 cursor-pointer"
                                        >
                                            <XMarkIcon className="size-4"/>
                                        </button>
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
                                        ref={subTaskInputRef}
                                        className="border rounded w-full border-solid p-1"
                                        type="text"
                                        value={subTaskInput}
                                        onChange={e => setSubTaskInput(e.target.value)}
                                        placeholder="Add a new subtask"

                                        onKeyDown={keyDownHandler}
                                    />
                                    <button 
                                        onClick={handleAddSubTask}
                                        className="cursor-pointer text-mint-500"
                                    >
                                        <PlusIcon className="size-5"/>
                                    </button>
                                    <button className="cursor-pointer text-red-500" onClick={() => setAddingSubTask(false)}><XMarkIcon className="size-5"/></button>
                                </>
                            }
                        </div>
                    </div>

                    
                </div>
            </div>
        </section>
    );
}
