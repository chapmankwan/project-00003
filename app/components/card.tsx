import Link from "next/link";

import type { TodoListModel } from "@/models"

import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import React from "react";

interface CardModel {
    setIsDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTaskListId: React.Dispatch<React.SetStateAction<string>>;
    taskList: TodoListModel;
}

export const Card = ({
    setIsDeleteDialog,
    setSelectedTaskListId,
    taskList
}: CardModel) => {
    
    const completedTasks = taskList.tasks.filter( task => task.completed).length;
    const totalNumberOfTasks = taskList.tasks.length;

    const completedMatchesTotal = completedTasks === totalNumberOfTasks;
    const haveTasks = totalNumberOfTasks > 0;


    const onDeleteHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsDeleteDialog(true);
        setSelectedTaskListId(taskList._id)
    };

    return (
        <Link
            href={`/todo-lists/${taskList._id}/${taskList.slug}`}
            className={clsx((haveTasks && completedMatchesTotal) 
            ? "bg-lime-900 hover:bg-lime-800" 
            : "bg-slate-700 hover:bg-slate-600",
            "flex items-center first:mt-0 last:mb-0 my-3 p-3 h-16 rounded-sm gap-3 cursor-pointer")}
        >
            <div 
                // href={`/todo-lists/${taskList._id}/${taskList.slug}`}
                className="flex-1"
            >
                <span>{taskList.title}</span>
            </div>

            <div className="flex items-center gap-3">
                {
                    taskList.tasks.length > 0 ?
                    <>
                        {completedTasks === totalNumberOfTasks && <CheckCircleIcon className="size-5" />}
                        <p className="font-semibold">{completedTasks} / {totalNumberOfTasks}</p>
                    </>
                    :
                    <p className="text-slate-400">no tracks</p>
                }

                <button 
                    className="flex items-center justify-between cursor-pointer hover:text-red-500" 
                    onClick={onDeleteHandler}
                    title="delete"
                >
                    <TrashIcon className="size-5" />
                </button>
            </div>
        </Link>
    )
}