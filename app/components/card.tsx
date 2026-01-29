import Link from "next/link";

import type { TodoListModel } from "@/models/interfaces"
import { getCompletionProgress } from "@/app/utilities/completionProgress";
import { PriorityIcon, ProgressBar } from "@/app/components";

import { DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

interface CardModel {
    setIsDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTaskListId: React.Dispatch<React.SetStateAction<string>>;
    taskList: TodoListModel;
    duplicateTask: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Card = ({
    setIsDeleteDialog,
    setSelectedTaskListId,
    taskList,
    duplicateTask,
}: CardModel) => {
    
    const completedTasks = taskList.tasks?.filter( task => task.completed).length;
    const totalNumberOfTasks = taskList.tasks?.length;

    const completedMatchesTotal = completedTasks === totalNumberOfTasks;
    const haveTasks = totalNumberOfTasks > 0;

    const progress = getCompletionProgress(taskList.tasks)

    const onDeleteHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsDeleteDialog(true);
        setSelectedTaskListId(taskList._id)
    };

    return (
        <Link
            href={`/todo-lists/${taskList._id}/${taskList.slug}`}
            className={
                clsx(
                    (haveTasks && completedMatchesTotal) 
                        ? "bg-mint-900 hover:bg-mint-800" 
                        : "bg-mono-700 hover:bg-mono-600",
                    "flex items-center first:mt-0 last:mb-0 p-3 h-16 rounded-2xl gap-1 cursor-pointer mx-0.5",
                )}
        >
            <PriorityIcon priority={taskList.priority} />
            <span className="flex-1 text-nowrap text-ellipsis">{decodeURIComponent(taskList.title)}</span>

            <div className="flex flex-[0.5] items-center gap-2 justify-end">
                <div className="flex flex-col text-xs items-end w-full">
                    {
                        taskList.tasks?.length > 0 ?
                        <div className="flex flex-col gap-1 items-end w-full">
                            <p className="font-semibold text-nowrap">{completedTasks} / {totalNumberOfTasks}</p>

                            <ProgressBar percent={progress.percent} />
                        </div>
                        :
                        <p className="text-mono-400">no tracks</p>
                    }
                </div>

                <button 
                    className="cursor-pointer hover:text-lavender-400"
                    onClick={duplicateTask}
                    title="make a copy"
                >
                    <DocumentDuplicateIcon className="size-5" />
                </button>
                <button 
                    className="cursor-pointer hover:text-red-500" 
                    onClick={onDeleteHandler}
                    title="delete"
                >
                    <TrashIcon className="size-5" />
                </button>
            </div>
        </Link>
    )
}