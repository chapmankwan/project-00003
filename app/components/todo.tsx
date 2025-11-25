"use client";
import React, { Ref, useState } from "react";

import type {Task} from "@/models";
import { Types } from "mongoose";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
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
};

export const Todo = ({
    ref,
    index,
    task,
    deleteTask,
    openDetails,
    toggleTaskCompletion,
    updateTask,
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
            className="flex items-center bg-mono-600 hover:bg-mono-500 mx-3 my-1.5 p-2 gap-2 rounded-sm cursor-pointer"
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
                <input 
                    checked={task.completed} 
                    className="border-gray-300 rounded-sm bg-black"
                    onChange={() => toggleTaskCompletion(task)}
                    type="checkbox" />
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
                            <button className="cursor-pointer text-mint-500" onClick={handleUpdateSubtask}><CheckIcon className="size-5"/></button>
                            <button className="cursor-pointer text-red-500" onClick={() => {setIsEditingTask(false)}}><XMarkIcon className="size-5"/></button>
                        </div>
                    </div>
                    :
                    <span className={clsx(["w-full select-none text-nowrap text-ellipsis overflow-hidden", task.completed && "line-through"])} ref={ref}>
                        {task.text}
                    </span>
            }

            {/* <span className="text-sm text-mint-400">
                {task.edited ? "edited" : ""}
            </span> */}

            <div className={clsx(
                "text-xs",
                task.priority === "minor" && "text-mint-400",
                task.priority === "major" && "text-red-700",
            )}>{task.priority}</div>

            <Menu>
                <MenuButton 
                    className="inline-flex p-2 rounded cursor-pointer hover:bg-mono-600 md:hidden" 
                    onClick={handleOpenDetails}
                >
                    <EllipsisVerticalIcon className="size-6"/>
                </MenuButton>
            </Menu>

            <div className="ml-auto hidden md:block">
                <Menu>
                    <MenuButton 
                        className="inline-flex p-2 rounded cursor-pointer hover:bg-mono-600" 
                        onClick={stopPropagation}
                    >
                        <EllipsisVerticalIcon className="size-6"/>
                    </MenuButton>

                    <MenuItems
                        transition
                        anchor="top"
                        className="origin-top-right bg-mono-700 w-28 rounded-md hidden md:block"
                        onClick={(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => event.stopPropagation()}
                    >
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-gray-400 w-full"
                                onClick={() => setIsEditingTask(true)}
                            >
                                Edit
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-gray-400 w-full" 
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