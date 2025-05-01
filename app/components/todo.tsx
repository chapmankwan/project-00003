import type {Task} from "@/app/models";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

import { Ref } from "react";

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

    return (
        <li ref={ref} key={index} className="flex items-center bg-slate-700 m-3 p-2 gap-3 rounded-sm cursor-pointer">
            <label className="*:cursor-pointer">
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
                    <MenuButton className="inline-flex p-2 rounded-full cursor-pointer hover:bg-slate-600">
                        <EllipsisVerticalIcon className="size-6"/>
                    </MenuButton>

                    <MenuItems
                        transition
                        anchor="bottom end"
                        className="origin-top-right bg-slate-500 rounded-md"
                    >
                        <MenuItem>
                            <button className="flex items-center gap-2 cursor-pointer p-2 hover:text-gray-400 w-full">
                                Edit
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button className="flex items-center gap-2 cursor-pointer p-2 hover:text-red-500 w-full" onClick={() => deleteTask(index)}>
                                Delete
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>
        </li>
    );
}