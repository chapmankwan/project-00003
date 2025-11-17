"use client";
import React, { Ref } from "react";

import type {Task} from "@/models";
import { Types } from "mongoose";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronUpDownIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
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
    updateTask: (id: string, text:string) => void;
};

export const Todo = ({
    ref,
    index,
    task,
    deleteTask,
    openDetails,
    toggleTaskCompletion,
}: TodoModel) => {

    const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id.toString() });

    const stopPropagation = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        event.stopPropagation();
    };

    const handleOpenDetails = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        stopPropagation(event);
        openDetails(task);
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li 
            key={index} 
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center bg-slate-600 hover:bg-slate-500 mx-3 my-1.5 p-2 gap-2 rounded-sm cursor-pointer"
            onClick={() => toggleTaskCompletion(task)}
        >
            <button
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
                aria-label="Reorder task"
            >
                <ChevronUpDownIcon className="size-4 text-slate-400" />
            </button>
            <label className="*:cursor-pointer" onClick={stopPropagation}>
                <input 
                    checked={task.completed} 
                    className="border-gray-300 rounded-sm bg-black"
                    onChange={() => toggleTaskCompletion(task)}
                    type="checkbox" />
            </label>

            <span className={clsx(["w-full select-none text-nowrap text-ellipsis overflow-hidden", task.completed && "line-through"])} ref={ref}>
                {task.text}
            </span>

            <span className="text-sm text-lime-400">
                {task.edited ? "edited" : ""}
            </span>

            <Menu>
                <MenuButton 
                    className="inline-flex p-2 rounded cursor-pointer hover:bg-slate-600 md:hidden" 
                    onClick={handleOpenDetails}
                >
                    <EllipsisVerticalIcon className="size-6"/>
                </MenuButton>
            </Menu>

            <div className="ml-auto hidden md:block">
                <Menu>
                    <MenuButton 
                        className="inline-flex p-2 rounded cursor-pointer hover:bg-slate-600" 
                        onClick={stopPropagation}
                    >
                        <EllipsisVerticalIcon className="size-6"/>
                    </MenuButton>

                    <MenuItems
                        transition
                        anchor="top"
                        className="origin-top-right bg-slate-700 w-28 rounded-md hidden md:block"
                        onClick={(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => event.stopPropagation()}
                    >
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-gray-400 w-full"
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