"use client";
import { useState } from "react";

import { Todo } from "@/app/components/todo";
import type { Task } from "@/app/models";

const taskList: Task[] = [
    {
        id: "1",
        text: "This is the first task for visual representation",
        completed: false,
    },
    {
        id: "2",
        text: "This is the second task for visual representation, it is completed",
        completed: true,
    },
    {
        id: "3",
        text: "This is the first task for visual representation",
        completed: false,
    },
];

export default function TodoList () {
    const [tasks, setTasks] = useState(taskList);

    const deleteTask = (index: number) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    const toggleTaskCompletion = (index: number) => {
        const updatedTasks = tasks.map( (task, i) => index === i ? { ...task, completed: !task.completed } : task);
        setTasks(updatedTasks);
    }

    return (
        <section className="flex flex-col items-center">
            <h3 className="w-full text-2xl p-7">Todo list</h3>

            <ul className="w-[90%] md:w-2/3 mx-3 bg-slate-600 rounded-md">
                {
                    tasks.map((task, index) => 
                        <Todo 
                            key={index}
                            index={index}
                            deleteTask={deleteTask}
                            toggleTaskCompletion={toggleTaskCompletion}
                            task={task} 
                        />
                    )
                }
            </ul>
        </section>
    )
};