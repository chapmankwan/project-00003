import Link from "next/link";

import type { TodoListModel } from "@/models"

import { DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import React from "react";

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


    const onDeleteHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsDeleteDialog(true);
        setSelectedTaskListId(taskList._id)
    };

    const taskPriorityColour = (priority: string) => {
        let priorityColour: string = "";
        switch (priority) {
            case 'minor':
                priorityColour = "text-mint-400"
                break;
            case 'moderate':
                priorityColour = "text-lavender-400"
                break;
            case 'major':
                priorityColour = "text-red-700"
                break;
        }
        return priorityColour
    }

    return (
        <Link
            href={`/todo-lists/${taskList._id}/${taskList.slug}`}
            className={clsx((haveTasks && completedMatchesTotal) 
            ? "bg-mint-900 hover:bg-mint-800" 
            : "bg-mono-700 hover:bg-mono-600",
            "flex items-center first:mt-0 last:mb-0 p-3 h-16 rounded-sm gap-3 cursor-pointer")}
        >
            <span className="flex-1">{taskList.title}</span>

            <div className="flex items-center gap-3">
                <div className="flex flex-col text-xs items-end">
                    {
                        taskList.tasks?.length > 0 ?
                        <div className="flex gap-1 items-center">
                            <p className="font-semibold">{completedTasks} / {totalNumberOfTasks}</p>
                        </div>
                        :
                        <p className="text-mono-400">no tracks</p>
                    }
                    <div className={taskPriorityColour(taskList.priority)}>{taskList.priority}</div>
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