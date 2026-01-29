"use client";
import React, { Ref, useState } from "react";

import type {Task} from "@/models/interfaces";
import { Types } from "mongoose";

import { Checkbox, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TodoModel {
    ref:  Ref<HTMLLIElement | null>; // fix
    index: number;
    task: Task;
    deleteTask: (taskId: Types.ObjectId) => void;
    openDetails: (task: Task) => void;
    toggleTaskCompletion: (task: Task) => void;
    updateTask: (task: Task, text: string) => void;
    isLast: boolean;
};

export const Todo = ({
    ref,
    index,
    task,
    deleteTask,
    openDetails,
    toggleTaskCompletion,
    updateTask,
    isLast,
}: TodoModel) => {

    // For DnD
    const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id.toString() });

    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editingTaskInput, setEditingTaskInput] = useState(task.text);

    const stopPropagation = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        event.stopPropagation();
    };

    const handleOpenDetails = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        stopPropagation(event);
        openDetails(task);
    };

    const handleUpdateSubtask = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        stopPropagation(event);
        if (editingTaskInput.length > 0 && isEditingTask) {
            
            updateTask(task, editingTaskInput)
            setIsEditingTask(false);
        };
    };

    const handleCancelEditingSubtask = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        stopPropagation(event);
        setIsEditingTask(false);
    };

    const draggingStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li 
            key={index} 
            ref={setNodeRef}
            style={draggingStyle}
            {...attributes}
            className={clsx(
                "flex items-center bg-mono-700 hover:bg-mono-600 p-2 gap-2 cursor-pointer border border-t-0 border-r-0 border-l-0 border-solid border-mono-800",
                index === 0 && "rounded-t-md",
                isLast && "rounded-b-md border-b-0",
            )}
            onClick={() => toggleTaskCompletion(task)}
            title={task.text}
        >
            <button
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
                aria-label="Reorder task"
            >
                <ChevronUpDownIcon className="size-4 text-mono-400" />
            </button>
            <label className="*:cursor-pointer" onClick={stopPropagation}>
                {/* <input 
                    checked={task.completed} 
                    className="border-mono-300 rounded-sm bg-black"
                    onChange={() => toggleTaskCompletion(task)}
                    type="checkbox" /> */}
                    <Checkbox
                        checked={task.completed} 
                        className="group block size-3 rounded-sm border border-mono-100 bg-mono-100 data-checked:bg-lavender-500 data-checked:border-lavender-500"
                        // className="border-mono-300 rounded-sm bg-black"
                        onChange={() => toggleTaskCompletion(task)}
                    >
                        <CheckIcon className="stroke-lavender-100 stroke-3 stroke opacity-0 group-data-checked:opacity-100"/>
                    </Checkbox>
            </label>

            {
                isEditingTask ? 
                    <div className="flex w-full justify-between items-center">
                        <input 
                            className="border border-solid rounded p-1 w-full"
                            type="text" 
                            value={editingTaskInput} 
                            onChange={e => setEditingTaskInput(e.target.value)} 
                            onClick={stopPropagation}
                        />
                        <div className="flex items-center gap-2 ml-2">
                            <button className="cursor-pointer hover:text-mint-500" onClick={handleUpdateSubtask}><CheckIcon className="size-5"/></button>
                            <button className="cursor-pointer hover:text-red-500" onClick={handleCancelEditingSubtask}><XMarkIcon className="size-5"/></button>
                        </div>
                    </div>
                    :
                    <span className={clsx(["w-full select-none text-nowrap text-ellipsis overflow-hidden", task.completed && "line-through"])} ref={ref}>
                        {task.text}
                    </span>
            }
            
            <div className="text-xs flex flex-col items-end">
                {/* <span className="text-mint-400">
                    {task.edited ? "edited" : ""}
                </span> */}
                <span className={clsx(
                    task.priority === "minor" && "text-mint-400",
                    task.priority === "major" && "text-red-700",
                )}>
                    {task.priority}
                </span>
            </div>


            <Menu>
                <MenuButton 
                    className="inline-flex p-2 rounded cursor-pointer hover:bg-mono-700 md:hidden" 
                    onClick={handleOpenDetails}
                >
                    <EllipsisVerticalIcon className="size-6"/>
                </MenuButton>
            </Menu>

            <div className="ml-auto hidden md:block">
                <Menu>
                    <MenuButton 
                        className="inline-flex p-2 rounded cursor-pointer hover:bg-mono-700" 
                        onClick={stopPropagation}
                    >
                        <EllipsisVerticalIcon className="size-6"/>
                    </MenuButton>

                    <MenuItems
                        transition
                        anchor={index === 0 ? "left start" : isLast ? "left end" : "left"}
                        className="origin-top-right bg-mono-500 w-28 rounded-md drop-shadow-md drop-shadow-mono-800 hidden md:block"
                        onClick={stopPropagation}
                    >
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-mono-400 w-full"
                                onClick={() => setIsEditingTask(true)}
                            >
                                Edit
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-mono-400 w-full" 
                                onClick={() => openDetails(task)}>
                                Show details
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-red-500 w-full" 
                                onClick={() => deleteTask(task._id)}>
                                Delete
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>
        </li>
    );
}