import Link from "next/link";

import type { TodoListModel } from "@/app/models"

interface DailyCardModel {
    taskList: TodoListModel
}

export const DailyCard = ({
    taskList
}: DailyCardModel) => {

    return (
        <Link 
            href={`/todo-lists/${taskList.id}/${taskList.slug}`}
            className="m-3 p-2 flex items-center justify-between cursor-pointer rounded-sm gap-3 bg-slate-700 hover:bg-slate-600"
        >
            <span>{taskList.dateCreated}</span>
            {
                taskList.tasks.length > 0 ?
                <span>{taskList.tasks.filter( task => task.completed).length} / {taskList.tasks.length} tasks completed</span>
                :
                <span>No tasks yet</span>
            }
        </Link>
    )
}