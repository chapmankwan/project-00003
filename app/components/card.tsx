import Link from "next/link";

import type { TodoListModel } from "@/app/models"

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface CardModel {
    taskList: TodoListModel
}

export const Card = ({
    taskList
}: CardModel) => {
    
    const completedTasks = taskList.tasks.filter( task => task.completed).length;
    const totalNumberOfTasks = taskList.tasks.length;

    return (
        <Link 
            href={`/todo-lists/${taskList.id}/${taskList.slug}`}
            className={clsx(completedTasks === totalNumberOfTasks
                    ? "bg-lime-900 hover:bg-lime-800" 
                    : "bg-slate-700 hover:bg-slate-600", 
                    "first:mt-0 last:mb-0 my-3 p-3 flex h-16 items-center justify-between cursor-pointer rounded-sm gap-3")}
        >
            <span>{taskList.title}</span>
            {
                taskList.tasks.length > 0 ?
                <span className="flex items-center gap-2">
                    <CheckCircleIcon className="size-5" />
                    <p className="font-semibold">{completedTasks} / {totalNumberOfTasks}</p>
                    <p className="hidden md:block">completed</p>
                </span>
                :
                <span>No tasks yet</span>
            }
        </Link>
    )
}