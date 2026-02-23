"use client";
import { useEffect, useState } from "react";

import { FlyoutPanel, MoveableFab } from "@/app/components";

import { useRouter } from 'next/navigation';

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Types } from "mongoose";

interface DailyTaskModel {
    _id: Types.ObjectId;
    text: string;
    description?: string;
    order: number;
    priority: "minor" | "moderate" | "major";

}

export default function TemplatesPage () {

    const router = useRouter();

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    const [dailyTasks, setDailyTasks] = useState<DailyTaskModel[]>([]);

    const addTask = async (text:string, priority: string = "moderate", description?: string, ) => {
        if (!text.trim()) return;

        const order = dailyTasks.length;
        
        try {
            const response = await fetch(`/api/daily/template`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text: text, 
                    priority: priority, 
                    order: order,
                    description: description, 
                 }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save task: ${response.statusText}`);
            }

            const newTask = await response.json();

            setDailyTasks([...dailyTasks, newTask])

            console.log("+++ newTask", newTask);
        } catch (err) {
            console.error("Failed to add task", err);
        }
    };

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
                <h1>Build a daily task</h1>
            </section>
            
            <ul>
                {
                    dailyTasks.map( task => {
                        return (
                            <li key={task._id.toString()}>{task.text}</li>
                        )
                    })
                }
            </ul>

            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={({text, priority, description} ) => addTask(text, priority, description)}
                    panelTitle="Create a Daily Task"
                    type="todo"
                />
            }
            <MoveableFab onClick={() => setIsFlyoutOpen(true)} />
        </div>
    );
};