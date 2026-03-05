"use client";

import { useEffect, useState } from "react";
import { DailyList } from "./dailylist";
import { TodoListModel } from "@/models/interfaces";

export default function DailyPage() {
    const [list, setList] = useState<TodoListModel|null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const getDailiesResponse = await fetch(`/api/daily`);
                if (!getDailiesResponse.ok) throw new Error("Failed to get list for daily tasks");
                const dailiesList = await getDailiesResponse.json();

                setList(dailiesList);
            } catch (err) {
                console.error("There was an error loading the tasks, check logs", err);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [])

    if (!list) return <div className="flex items-center justify-center">Loading...</div>;

    return (
        <DailyList listId={list._id} initialTasks={list.tasks}/>
    );
}
