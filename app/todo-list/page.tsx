"use client";
import { useEffect, useRef, useState } from "react";

import { Loader, Todo } from "@/app/components";
import type { Task } from "@/app/models";
import Form from "next/form";

export default function TaskList () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    
    const lastTaskRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const timer = setTimeout( () => {
            const key = new Date().toISOString().split('T')[0];
            const data = localStorage.getItem('dailyTasks');
            const parsed = data ? JSON.parse(data) : {};
            const loaded = parsed[key] || [];
            setTasks(loaded);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        // Scroll the last task into view
        if (lastTaskRef.current) {
            lastTaskRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [tasks]);
    
    const getTodayKey = () => new Date().toISOString().split('T')[0];
    
    const saveTasks = (tasks: Task[]) => {
        const key = getTodayKey();
        const existing = localStorage.getItem('dailyTasks');
        const parsed = existing ? JSON.parse(existing) : {};
        parsed[key] = tasks;
        localStorage.setItem('dailyTasks', JSON.stringify(parsed));
      };

    const deleteTask = (index: number) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const deleteAllTasks = () => {
        const updatedTasks: Task[] = [];
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    }


    const toggleTaskCompletion = (index: number) => {
        const updatedTasks = tasks.map( (task, i) => index === i ? { ...task, completed: !task.completed } : task);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const addTask = () => {
        if (!input.trim()) return;
        const newTask = {
            id: crypto.randomUUID(),
            text: input.trim(),
            completed: false,
        };
        const updated = [...tasks, newTask];
        setTasks(updated);
        saveTasks(updated);
        setInput('');
      };

    const completedTasks = tasks.filter( task => task.completed).length;

    const totalTasks = tasks.length;

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        // Prevent the form submission which causes a full page reload? Double check with Next JS
        event.preventDefault();
        addTask();
    }

    return (
        <section className="flex-1 flex flex-col items-center h-[calc(100vh-56px)]">
            <h3 className="w-full text-2xl p-7 cursor-default select-none">Task list</h3>

            <div className="p-2">Tasks completed: {completedTasks} / {totalTasks} </div>
            <button className="m-2 p-2 cursor-pointer" onClick={deleteAllTasks}>delete all</button>

            {
                loading ? <Loader/> :

                <ul className="space-y-2 w-[90%] md:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto">
                {
                    tasks.map((task, index) => {
                        const isLast = index === tasks.length - 1;

                        return (
                            <Todo 
                                ref={isLast ? lastTaskRef : null}
                                key={index}
                                index={index}
                                deleteTask={deleteTask}
                                toggleTaskCompletion={toggleTaskCompletion}
                                task={task} 
                            />
                        )
                    })
                }
                </ul>
            }

            <section className="sticky bottom-0 z-10 flex justify-center items-center w-full mx-auto p-4 bg-slate-800">
                <Form action="/todo-list" onSubmit={onSubmitHandler} className="flex w-3/4 bg-slate-700 p-4 rounded-md">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full border border-solid rounded p-2"
                        placeholder="Add a new task"
                    />
                    <button type="submit" className="ml-2 bg-soft-lavender-500 text-white p-2 rounded-lg hover:bg-soft-mint-green-500">
                        Add
                    </button>
                </Form>
            </section>
        </section>
    );
};