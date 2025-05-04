"use client";
import { useState } from "react";

import type {Task} from "@/app/models";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

import React, { Ref } from "react";

interface TodoListModel {
    ref:  Ref<HTMLLIElement | null>; // fix
    index: number;
    task: Task;
    deleteTask: (index: number) => void;
    toggleTaskCompletion: (index: number) => void;
    updateTask: (id: string, text:string) => void;
};

export const Todo = ({
    ref,
    index,
    task,
    deleteTask,
    toggleTaskCompletion,
    updateTask,
}: TodoListModel) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTaskInput, setEditTaskInput] = useState("");

    const stopPropagation = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        event.stopPropagation();
    };

    const editTaskHandler = () => {
        setIsEditing(true);
        setEditTaskInput(task.text);
    };
      
    const cancelEditing = () => {
        setIsEditing(false);
        setEditTaskInput("");
    };


    return (
        <li 
            className="flex items-center bg-slate-700 hover:bg-slate-600 m-3 p-2 gap-3 rounded-sm cursor-pointer"
            key={index} 
            onClick={() => toggleTaskCompletion(index)}
            ref={ref} 
        >
            <label className="*:cursor-pointer" onClick={stopPropagation}>
                <input 
                    checked={task.completed} 
                    className="border-gray-300 rounded-sm bg-black"
                    onChange={() => toggleTaskCompletion(index)}
                    type="checkbox" />
            </label>

            {
                isEditing ?
                <input 
                    autoFocus
                    className="p-1 w-full"
                    value={editTaskInput}
                    onClick={stopPropagation}
                    onChange={(e) => {setEditTaskInput(e.target.value)}}
                    onBlur={() => updateTask(task.id, editTaskInput)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateTask(task.id, editTaskInput);
                            setIsEditing(false);
                        }
                        if (e.key === 'Escape') cancelEditing();
                    }}
                />
                :
                <span className="w-full select-none">
                    {task.text}
                </span>
            }

            <div className="ml-auto">
                <Menu>
                    <MenuButton 
                        className="inline-flex p-2 rounded-full cursor-pointer hover:bg-slate-600" 
                        onClick={stopPropagation}
                    >
                        <EllipsisVerticalIcon className="size-6"/>
                    </MenuButton>

                    <MenuItems
                        transition
                        anchor="left"
                        className="origin-top-right bg-slate-500 rounded-md"
                        onClick={stopPropagation}
                    >
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-gray-400 w-full"
                                onClick={editTaskHandler}
                            >
                                Edit
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-red-500 w-full" 
                                onClick={() => {deleteTask(index)}}>
                                Delete
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>
        </li>
    );
}