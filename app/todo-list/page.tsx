"use client";
import { useEffect, useRef, useState } from "react";

import { Todo } from "@/app/components";
import type { Task } from "@/app/models";
import Form from "next/form";

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

export default function TaskList () {
    const [tasks, setTasks] = useState(taskList);
    const [newTask, setNewTask] = useState("");

    const lastTaskRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        // Scroll the last task into view
        if (lastTaskRef.current) {
          lastTaskRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [tasks]);

    const deleteTask = (index: number) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    const toggleTaskCompletion = (index: number) => {
        const updatedTasks = tasks.map( (task, i) => index === i ? { ...task, completed: !task.completed } : task);
        setTasks(updatedTasks);
    };

    const addTask = () => {
        if (!newTask) return;
        setTasks([...tasks, { id:Math.random().toString(), text: newTask, completed: false }]);
        setNewTask('');
      };

    const completedTasks = tasks.filter( task => task.completed).length;

    const totalTasks = tasks.length;

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        // Prevent the form submission which causes a full page reload? Double check with Next JS
        event.preventDefault();
        addTask();
    }

    return (
        <section className="flex flex-col items-center min-h-[calc(100vh-56px)]">
            <h3 className="w-full text-2xl p-7 cursor-default select-none">Task list</h3>

            <div className="p-2">Tasks completed: {completedTasks} / {totalTasks} </div>

            <ul className="w-[90%] md:w-2/3 mx-3 rounded-md flex-grow overflow-auto h-full overflow-y-auto">
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

            {/* <MessageBox addTask={addTask} setNewTask={(event) => setNewTask(event.target.value))}/> */}

            <section className="sticky bottom-0 z-10 flex justify-center items-center w-full mx-auto p-4 bg-slate-800 drop-shadow-xl drop-shadow-slate-700">
                <Form action="/todo-list" onSubmit={onSubmitHandler} className="flex w-3/4 bg-slate-700 p-4 rounded-md">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="w-full border border-solid rounded p-2"
                        placeholder="Add a new task"
                    />
                    <button type="submit" className="ml-2 bg-soft-lavender-500 text-white p-2 rounded-lg hover:bg-soft-mint-green-500">
                        Add
                    </button>
                </Form>
            </section>
        </section>
    )
};