"use client"
import { useEffect, useState } from "react";

import { DailyCard, Loader } from "@/app/components";
import type { Task } from "@/app/models";

interface TaskDatabaseModel {
    date: string;
    tasks: Task[];
}

export default function Tracker () {
    const [allData, setAllData] = useState<TaskDatabaseModel[]>([])
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const timer = setTimeout( () => {
            const data = localStorage.getItem("dailyTasks");
            const parsedData = data ? JSON.parse(data) : {}
            const taskList:TaskDatabaseModel[] = Object.entries(parsedData).map(([date, tasks]) => ({
                date,
                tasks: tasks as Task[],
            })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // latest first

            setAllData(taskList);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    },[]);


    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100vh-56px)]">
            <h3 className="w-full text-2xl p-7 cursor-default select-none">Workspaces</h3>
            {
                loading ? 
                <Loader /> :
                <ul className="space-y-2 w-[90%] md:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto">
                    {
                        allData.length > 0 ?
                        allData.map( (data, index) => {
                            return (
                                <DailyCard key={index} date={data.date} tasks={data.tasks} />
                            )
                        })
                        :
                        <li>
                        </li>
                    }
                </ul>
            }
        </section>
    )
}