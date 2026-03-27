"use client";

import { useEffect, useRef, useState } from "react";

import { DailyNavigator, DetailsPanel, Loader, Todo } from "@/app/components";
import { getTodayString } from "../components/daily-navigator/utilities";

// import { DailyList } from "./dailylist";
import { Task, TodoListModel } from "@/models/interfaces";

import Link from "next/link";
import { useRouter } from 'next/navigation';

import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

export default function DailyPage() {
    const [list, setList] = useState<TodoListModel|null>(null);

    const router = useRouter();

    // local states
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0)
    
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const openDetails = (task: Task) => setSelectedTask(task);
    const closeDetails = () => setSelectedTask(null);

    // references
    const justAddedRef = useRef(false);
    const lastTaskRef = useRef<HTMLLIElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    
    // this hook allows user to scroll to latest task after adding
    useEffect(() => {
        // Scroll to the latest task
        const timer = setTimeout(() => {
            if (lastTaskRef.current) {
                lastTaskRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                // Makes sure to reset the reference point for next task added
                justAddedRef.current = false;
            }
        }, 300);
        
        return () => clearTimeout(timer)
    }, [tasks]);

    useEffect(() => {
        if( titleInputRef.current ) titleInputRef.current.focus();
    },[isEditingTitle])

    const toggleTaskCompletion = async (habit: Task) => {
        if (!habit || !habit._id) return;

        // Optimistic update visually
        setTasks((prev) =>
            prev.map((t) =>
                t._id === habit._id
                    ? { ...t, completed: !habit.completed, edited: true }
                    : t
            )
        );

        try {
            const response = await fetch(`/api/daily/${list?._id}/habit/${habit._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) console.error("There was an error with the toggle response", response.statusText)
    
            const { task, completedCount } = await response.json();
            
            // finalize from backend if necessary
            setTasks( prev => prev.map( h => h._id === task?._id ? task : h));
            setCompletedCount(completedCount);

        } catch (err) {
            console.error("There was an error toggling the task", err);
        }
    };

    const [selectedDate, setSelectedDate] = useState(getTodayString());

    // Replace your existing dateString with selectedDate
    useEffect(() => {
        const fetchDaily = async () => {
            const res = await fetch(`/api/daily?date=${selectedDate}`);
            const data = await res.json();
            setTasks(data.tasks);
            setCompletedCount(data.completedCount ?? 0);
            setTotalCount(data.totalCount ?? 0);
        };
        fetchDaily();

        setLoading(false);
    }, [selectedDate]); // ← reruns whenever date changes

    const localDate = new Date();
    const dateString = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const getDailiesResponse = await fetch(`/api/daily?date=${dateString}`);

                if (!getDailiesResponse.ok) throw new Error("Failed to get list for daily tasks");
                const dailiesList = await getDailiesResponse.json();

                setList(dailiesList);
            } catch (err) {
                console.error("There was an error loading the tasks, check logs", err);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [dateString])

    if (!list) return <div className="flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            <section className="flex py-3 w-[85%] md:w-2/3 items-center">
                <button 
                    className="cursor-pointer mr-3 flex items-center"
                    onClick={() => router.back()}
                    title="back to collection"
                >
                        <ChevronLeftIcon className="size-5"/>
                </button>

                <button onClick={() => setIsEditingTitle(true)} className="font-bold cursor-default p-1">Dailies</button>

                <Link href="/dailies/templates" className="px-1.5 py-0.5 ml-auto bg-mint-600 hover:bg-mint-700 rounded-sm">
                    habit templates
                </Link>
            </section>

            <div>
                {completedCount} / {totalCount}
            </div>

            <DailyNavigator selectedDate={selectedDate} onDateChange={setSelectedDate}/>

            {
                loading ? 
                <Loader/> :
                <ul className={clsx(
                    "w-[85%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col rounded-md touch-pan-y scrollbar-soft",
                    "transition-[max-height] duration-300 max-h-[100dvh]"
                    )}>
                    {
                        tasks.map((task, index) => {
                            const isLast = index === tasks.length - 1;

                            return (
                                <Todo 
                                    ref={isLast ? lastTaskRef : null}
                                    key={task._id?.toString()}
                                    index={index}
                                    deleteTask={() => console.log("+++ remove deleteTask Todo for Dailies")}
                                    task={task} 
                                    toggleTaskCompletion={toggleTaskCompletion}
                                    openDetails={openDetails}
                                    updateTask={() => console.log("+++ remove updateTask Todo for Dailies")}
                                    isLast={isLast}
                                />
                            )
                        })
                    }
                </ul>
            }

            {selectedTask && (
                <DetailsPanel
                    task={tasks.find( t => t._id === selectedTask._id ) || selectedTask}
                    onClose={closeDetails}
                    deleteTask={() => console.log("+++ remove deleteTask in DetailsPanel")}
                    // Prevent updating task for dailies - can only be done on the templates section
                    listId={list._id}
                />
            )}
        </div>
    );
}
