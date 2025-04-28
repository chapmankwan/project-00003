import type {Task} from "@/app/models";
import { PencilSquareIcon,TrashIcon } from "@heroicons/react/24/outline";


interface TodoListModel {
    index: number;
    task: Task;
    deleteTask: (index: number) => void;
    toggleTaskCompletion: (index: number) => void;
}

export const Todo = ({
    index,
    task,
    deleteTask,
    toggleTaskCompletion
}: TodoListModel) => {
    const selectableText = false;

    const EditButton = () => {
        return (
            <button className="cursor-pointer">
                <PencilSquareIcon className="size-6 hover:text-gray-400" />
            </button>
        )
    };
    const DeleteButton = () => {
        return (
            <button className="cursor-pointer" onClick={() => deleteTask(index)}>
                <TrashIcon className="size-6 hover:text-red-500"/>
            </button>
        )
    };


    return (
        <li key={index} className="flex items-center bg-slate-700 m-3 p-3 gap-3 rounded-sm" onClick={() => toggleTaskCompletion(index)}>
            <label className="*:cursor-pointer">
                <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(index)} />
            </label>

            <span className={selectableText ? "select-text" : "select-none"}>
                {task.text}
            </span>
            
            <div id="task-button-group" className="flex ml-auto gap-1">
                <EditButton />
                <DeleteButton />
            </div>
        </li>
    )
}