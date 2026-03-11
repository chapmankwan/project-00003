"use client";
import { useEffect, useState } from "react";

import { FlyoutPanel, MoveableFab, PriorityIcon } from "@/app/components";
import { rruleToHumanReadable } from "@/app/utilities/rrule";

import { useRouter } from 'next/navigation';

import { ChevronLeftIcon, ChevronUpDownIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Types } from "mongoose";

interface DailyTaskTemplateModel {
    _id: Types.ObjectId;
    text: string;
    description?: string;
    order: number;
    priority: "minor" | "moderate" | "major";
    recurrence: string;
};

export default function TemplatesPage () {

    const router = useRouter();

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    const [dailyTasks, setDailyTasks] = useState<DailyTaskTemplateModel[]>([]);

    const addHabit = async (text: string, priority: string, description?: string, recurrence?: string) => {

        try {
            const response = await fetch(`/api/daily/template`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: text,
                    priority: priority,
                    description: description,
                    recurrence: recurrence
                })
            });
            const savedHabit = await response.json();
            setDailyTasks([...dailyTasks, savedHabit])
        } catch (err) {
            console.error("Error saving habit", err);
            throw err
        }
    }

    const deleteTask = async ( templateId: Types.ObjectId ) => {
        try {
            const res = await fetch(`/api/daily/template/${templateId}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );
        
            if (!res.ok) throw new Error("Failed to delete template");
            await res.json();
            return setDailyTasks((prev) => prev.filter( t => t._id?.toString() !== templateId.toString()))
        } catch (err) {
            console.error("Error deleting habit", err);
        }
    }

    useEffect( () => {
        const timer = setTimeout( async () => {
            try {
                const getResponse = await fetch(`/api/daily/template`, {method: "GET"});
                if (!getResponse.ok) throw new Error("Failed to get daily task templates");

                const list = await getResponse.json();

                setDailyTasks(list);
            } catch (err) {
                console.error("There was an error loading the daily task templates", err);
            };
        }, 500);

        return () => clearTimeout(timer);
    }, [])

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            <section className="flex py-3 w-[85%] md:w-2/3">
                <button 
                    className="cursor-pointer mr-3"
                    onClick={() => router.back()}
                    title="go back"
                >
                        <ChevronLeftIcon className="size-5"/>
                </button>

                <button className="font-bold cursor-text p-1">Daily templates</button>
            </section>

            <ul className={clsx(
                "w-[85%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col rounded-md touch-pan-y scrollbar-soft",
                isFlyoutOpen ? "transition-[max-height] max-h-[47dvh] duration-300 md:max-h-none" : "transition-[max-height] duration-300 max-h-[100dvh]"
            )}>
                {
                    dailyTasks.length > 0 ?
                    dailyTasks.map( (task: DailyTaskTemplateModel, index: number) => {
                        const isLast = index === dailyTasks.length - 1;

                        return (
                            <li key={task._id.toString()} className={clsx(
                                "flex gap-2 bg-mono-700 p-2 cursor-pointer border border-t-0 border-r-0 border-l-0 border-solid border-mono-800",
                                index === 0 && "rounded-t-md",
                                isLast && "rounded-b-md border-b-0",
                            )}>
                                
                                <button>
                                    <ChevronUpDownIcon className="size-4 text-mono-400" />
                                </button>

                                <div className="flex flex-col w-full min-h-29 gap-2">
                                    {task.text}

                                    <div className="flex items-center gap-1 text-xs">
                                        <PriorityIcon priority={task.priority} showText />
                                    </div>

                                    <span className="line-clamp-2 text-xs text-mono-300/70">
                                        {task.description}
                                    </span>

                                    <span className="text-xs text-mono-300">
                                        Recurrence: {rruleToHumanReadable(task.recurrence)}
                                    </span>

                                    <div className="flex ml-auto gap-3 text-sm mt-auto">
                                        <button 
                                            // onClick={() => deleteTask(task._id)}
                                            className="flex gap-1 items-center"
                                        >
                                            Edit <PencilSquareIcon className="size-4"/>
                                        </button>
                                        <button 
                                            onClick={() => deleteTask(task._id)}
                                            className="flex gap-1 items-center text-red-200/90"
                                        >
                                            Delete <TrashIcon className="size-4"/>
                                        </button>
                                    </div>
                                </div>

                            </li>
                        )
                    })
                    :
                    <span>Add a habit</span>
                }
            </ul>

            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={({text, priority, description, recurrence} ) => addHabit(text, priority, description, recurrence)}
                    panelTitle="Create a Daily Task"
                    type="todo"
                />
            }
            <MoveableFab onClick={() => setIsFlyoutOpen(true)} />
        </div>
    );
};