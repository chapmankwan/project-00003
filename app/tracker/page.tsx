"use client"
import { useEffect, useState } from "react";

import { DailyCard } from "@/app/components";
import type { Task } from "@/app/models";

interface TaskDatabaseModel {
    date: string;
    tasks: Task[];
}

export default function Tracker () {
    const [allData, setAllData] = useState<TaskDatabaseModel[]>([])

    useEffect( () => {
        const timer = setTimeout( () => {
            const data = localStorage.getItem("dailyTasks");
            const parsedData = data ? JSON.parse(data) : {}

            console.log("+++parsedData", parsedData);
            const taskList:TaskDatabaseModel[] = Object.entries(parsedData).map(([date, tasks]) => ({
                date,
                tasks: tasks as Task[],
            })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // latest first

            setAllData(taskList);
        }, 500);

        return () => clearTimeout(timer);
    },[]);


    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100vh-56px)]">
            <h3 className="w-full text-2xl p-7 cursor-default select-none">Task tracking</h3>
            <ul className="space-y-2 w-[90%] md:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto">
                {
                    allData.length > 0 ?
                    allData.map( (data, index) => {
                        console.log("+++ data", data.tasks)

                        return (
                            <DailyCard key={index} date={data.date} tasks={data.tasks} />
                        )
                    })
                    :
                    <li>
                    </li>
                }
            </ul>
        </section>
    )
}