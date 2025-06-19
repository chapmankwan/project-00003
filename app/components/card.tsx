import Link from "next/link";

import type { TodoListModel } from "@/models"

import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface CardModel {
    onDelete: (listId: string) => void;
    taskList: TodoListModel
}

export const Card = ({
    onDelete,
    taskList
}: CardModel) => {
    const completedTasks = taskList.tasks.filter( task => task.completed).length;
    const totalNumberOfTasks = taskList.tasks.length;

    const completedMatchesTotal = completedTasks === totalNumberOfTasks;
    const haveTasks = totalNumberOfTasks > 0;

    return (
        <div 
            className={clsx((haveTasks && completedMatchesTotal)
                        ? "bg-lime-900 hover:bg-lime-800" 
                        : "bg-slate-700 hover:bg-slate-600", 
                        "first:mt-0 last:mb-0 my-3 p-3 flex h-16 items-center justify-between cursor-pointer rounded-sm gap-3")}
        >
            <Link 
                href={`/todo-lists/${taskList._id}/${taskList.slug}`}
                className="flex-1 flex items-center justify-between"
            >
                <span>{taskList.title}</span>
                <span className="flex items-center gap-2">
                    {
                        taskList.tasks.length > 0 ?
                        <>
                            {completedTasks === totalNumberOfTasks && <CheckCircleIcon className="size-5" />}
                            <p className="font-semibold">{completedTasks} / {totalNumberOfTasks}</p>
                        </>
                        :
                        <p>no tracks</p>
                    }
                </span>
            </Link>
            <button 
                className="cursor-pointer ml-2" 
                onClick={() => 
                    confirm("Delete this list and all its tasks? This cannot be undone.") &&
                    onDelete(taskList._id)
                }
            >
                <TrashIcon className="size-5" />
            </button>
        </div>
    )
}