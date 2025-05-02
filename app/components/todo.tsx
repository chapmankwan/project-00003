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
};

export const Todo = ({
    ref,
    index,
    task,
    deleteTask,
    toggleTaskCompletion
}: TodoListModel) => {

    const stopPropagation = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement | HTMLLabelElement>) => {
        event.stopPropagation();
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

            <span className="w-full select-none">
                {task.text}
            </span>

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
                        anchor="bottom end"
                        className="origin-top-right bg-slate-500 rounded-md"
                        onClick={stopPropagation}
                    >
                        <MenuItem>
                            <button 
                                className="flex items-center gap-2 cursor-pointer p-2 hover:text-gray-400 w-full"
                                onClick={stopPropagation}
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