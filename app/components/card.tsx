import Link from "next/link";

import type { TodoListModel } from "@/app/models"

import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface CardModel {
    taskList: TodoListModel
}

export const Card = ({
    taskList
}: CardModel) => {

    return (
        <Link 
            href={`/todo-lists/${taskList.id}/${taskList.slug}`}
            className="
                first:mt-0 last:mb-0 my-3 p-3 flex h-16
                items-center justify-between cursor-pointer 
                rounded-sm gap-3
                bg-slate-700 hover:bg-slate-600"
        >
            <span>{taskList.title}</span>
            {
                taskList.tasks.length > 0 ?
                <span className="flex items-center gap-2">
                    <CheckCircleIcon className="size-5" />
                    <p className="font-semibold">{taskList.tasks.filter( task => task.completed).length} / {taskList.tasks.length}</p>
                    <p className="hidden md:block">completed</p>
                </span>
                :
                <span>No tasks yet</span>
            }
        </Link>
    )
}