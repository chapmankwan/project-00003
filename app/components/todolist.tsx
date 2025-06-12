"use client";
import { useEffect, useRef, useState } from "react";

import { Loader, Modal, Todo } from "@/app/components";
import { todaysDate } from "@/app/constants";
import type { Task } from "@/app/models";
import Form from "next/form";

export const TodoList = ({slug}: { slug: string}) => {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    
    const justAddedRef = useRef(false);
    const lastTaskRef = useRef<HTMLLIElement>(null);

    // vars
    const completedTasks = tasks.filter( task => task.completed).length;
    const totalTasks = tasks.length;

    // initialize the todolist with data
    useEffect(() => {
        const timer = setTimeout( () => {
            const data = localStorage.getItem('todoLists');
            const parsed = data ? JSON.parse(data) : {};
            const loaded = parsed[slug] || [];
            setTasks(loaded);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [slug]);
    
    // this hook allows user to scroll to latest task after adding
    useEffect(() => {
        // Scroll to the latest task
        if (justAddedRef.current && lastTaskRef.current) {
            lastTaskRef.current.scrollIntoView({ behavior: 'smooth' });
            // Makes sure to reset the reference point for next task added
            justAddedRef.current = false;
        }
    }, [tasks]);
    
    // saves the tasks to localstorage
    const saveTasks = (tasks: Task[]) => {
        const existing = localStorage.getItem('todoLists');
        const parsed = existing ? JSON.parse(existing) : {};
        parsed[slug] = tasks;
        localStorage.setItem('dailyTasks', JSON.stringify(parsed));
    };

    // remove selected task
    const deleteTask = (index: number) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    // deletes all tasks
    const deleteAllTasks = () => {
        const updatedTasks: Task[] = [];
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    // sets the selected task's completion status
    const toggleTaskCompletion = (index: number) => {
        const updatedTasks = tasks.map( (task, i) => index === i ? { ...task, completed: !task.completed, dateCompleted: !task.completed ? todaysDate : false } : task);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    // add new task
    const addTask = () => {
        if (!input.trim()) return;
        const newTask: Task = {
            completed: false,
            date: todaysDate,
            dateCompleted: false,
            edited: false,
            id: crypto.randomUUID(),
            text: input.trim(),
        };
        const updatedTasks = [...tasks, newTask];
        // Flag this as a new task added
        justAddedRef.current = true;
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        setInput('');
    };

    // Prevent the form submission which causes a full page reload? Double check with Next JS
    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addTask();
    }

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100vh-56px)]">
            <div className="flex justify-between items-center w-full">
                <h3 className="text-2xl p-7 cursor-default select-none">Task list</h3>
                {/* <p className="p-7 text-purple-300">{slug === todaysDate ? "Today" : slug}</p> */}
            </div>

            <div className="w-[90%] md:w-2/3 flex items-center justify-between bg-slate-500 rounded drop-shadow-lg mx-3">
                <div className="p-2">Tasks completed: {completedTasks} / {totalTasks} </div>
                <Modal  
                    mainButtonText="Delete all"
                    callback={deleteAllTasks}
                    disabled={ totalTasks === 0 }
                    leftButtonText="Cancel"
                    rightButtonText="Delete all"
                    modalTitle="Delete all tasks"
                    modalDescription="This will permanently delete all your written tasks"
                    modalExtraDetails="Are you sure you want to delete all your tasks? Deleted tasks will not be retrievable."
                />
            </div>

            {
                loading ? 
                <Loader/> :
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
                                task={task} 
                                toggleTaskCompletion={toggleTaskCompletion}
                                updateTask={(id:string, editInput ) => {
                                    const updatedTasks: Task[] = [...tasks];
                                    const index = updatedTasks.findIndex(task => task.id === id);
                                    updatedTasks[index].text = editInput;
                                    updatedTasks[index].edited = true;
                                    setTasks(updatedTasks);
                                    saveTasks(updatedTasks);
                                }}
                            />
                        )
                    })
                }
                </ul>
            }

            <section className="sticky bottom-0 z-10 flex justify-center items-center w-full mx-auto p-4 bg-slate-800">
                <Form action="/todo-list" onSubmit={onSubmitHandler} className="flex w-full md:w-3/4 bg-slate-700 p-4 rounded-md">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full border border-solid rounded p-2"
                        placeholder="Add a new task"
                        required
                    />
                    <button type="submit" className="ml-2 bg-soft-lavender-500 text-white p-2 rounded-lg hover:text-lime-400 cursor-pointer">
                        Add
                    </button>
                </Form>
            </section>
        </div>
    );
};