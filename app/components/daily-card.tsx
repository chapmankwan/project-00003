import type { Task } from "@/app/models"

interface DailyCardModel {
    date: string;
    tasks: Task[]
}

export const DailyCard = ({
    date,
    tasks,
}: DailyCardModel) => {

    return (
        <li className="m-3 p-2 flex items-center justify-between cursor-pointer rounded-sm gap-3 bg-slate-700 hover:bg-slate-600">
            <span>{date}</span>
            <span>{tasks.filter( task => task.completed).length} / {tasks.length} tasks completed</span>
        </li>
    )
}