import type {Task} from "@/app/models";
import { PencilSquareIcon,TrashIcon } from "@heroicons/react/24/outline";
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
    const selectableText = false;

    const EditButton = () => {
        return (
            <button className="cursor-pointer p-2 rounded-full hover:bg-slate-800">
                <PencilSquareIcon className="size-6 hover:text-gray-400" />
            </button>
        )
    };
    const DeleteButton = () => {
        return (
            <button className="cursor-pointer p-2 rounded-full hover:bg-slate-800" onClick={() => deleteTask(index)}>
                <TrashIcon className="size-6 hover:text-red-500"/>
            </button>
        )
    };


    return (
        <li ref={ref} key={index} className="flex items-center bg-slate-700 m-3 p-2 gap-3 rounded-sm">
            <label className="*:cursor-pointer">
                <input 
                    checked={task.completed} 
                    className="border-gray-300 rounded-sm bg-gray-50"
                    onChange={() => toggleTaskCompletion(index)}
                    type="checkbox" />
            </label>

            <span className={selectableText ? "select-text" : "select-none"}>
                {task.text}
            </span>

            <div id="task-button-group" className="flex ml-auto gap-2">
                <EditButton />
                <DeleteButton />
            </div>
        </li>
    );
}