"use client";

import { useEffect, useRef, useState } from "react";

import { DailyNavigator, DetailsPanel, Loader, Todo } from "@/app/components";
import { getTodayString, toUTCDateString } from "../components/daily-navigator/utilities";

// import { DailyList } from "./dailylist";
import { Task, TodoListModel } from "@/models/interfaces";

import Link from "next/link";

import clsx from "clsx";

interface HeatmapEntry {
    date: string;
    completedCount: number;
    totalCount: number;
};

export default function DailyPage() {

    // local states
    const [list, setList] = useState<TodoListModel|null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);

    const openDetails = (task: Task) => setSelectedTask(task);
    const closeDetails = () => setSelectedTask(null);

    // references
    const justAddedRef = useRef(false);
    const lastTaskRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const fetchDaily = async () => {
            setIsLoading(true);
            // reset states
            setList(null);
            setTasks([]);

            try {
                const res = await fetch(`/api/daily?date=${selectedDate}`);
                if (!res.ok) throw new Error("Failed to fetch daily");
                const data = await res.json();

                setList(data);
                setTasks(data.tasks);
            } catch (err) {
                console.error("Error loading daily:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDaily();
    }, [selectedDate]);
    
    // this hook allows user to scroll to latest task after adding
    useEffect(() => {
        if (!justAddedRef.current) return;
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

            // Patch the heatmap entry for selectedDate in place
            setHeatmapData(prev => prev.map(entry => {
                const entryDate = toUTCDateString(new Date(entry.date));
                if (entryDate !== selectedDate) return entry;
                return { ...entry, completedCount };
            }));

        } catch (err) {
            console.error("There was an error toggling the task", err);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            <section className="flex py-3 w-[85%] md:w-2/3 items-center">
                <h1 className="font-bold cursor-default p-1">Dailies</h1>

                <Link href="/dailies/templates" className="px-1.5 py-0.5 ml-auto text-sm bg-lavender-600 hover:bg-lavender-700 rounded-sm">
                    Habit Templates
                </Link>
            </section>

            <DailyNavigator 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate}
                heatmapData={heatmapData}
                onHeatmapLoad={setHeatmapData}
            />

            {
                isLoading ? 
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

            {list && selectedTask && (
                <DetailsPanel
                    task={tasks.find( t => t._id === selectedTask._id ) || selectedTask}
                    onClose={closeDetails}
                    listId={list._id}
                />
            )}
        </div>
    );
}
