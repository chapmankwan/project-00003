"use client";
import { useEffect, useRef, useState } from "react";

import { DetailPanel, Loader, Modal, PageHeader, Todo } from "@/app/components";
import type { Task } from "@/models";
import Form from "next/form";
import { useRouter } from 'next/navigation';

import { taskApiHooks } from "@/app/utilities/taskApiHooks";
import { toSlug } from "@/app/utilities";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";


export const TodoList = ({id}: { id:string}) => {

    const { saveTask, updateTask, deleteTask } = taskApiHooks(id);

    const router = useRouter();

    // local states
    const [tasks, setTasks] = useState<Task[]>([]);
    const [listTitle, setListTitle] = useState("")
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState("");

    const openDetails = (task: Task) => setSelectedTask(task);
    const closeDetails = () => setSelectedTask(null);

    // references
    const justAddedRef = useRef(false);
    const lastTaskRef = useRef<HTMLLIElement>(null);

    // initialize the todolist with data
    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const getResponse = await fetch(`/api/todo-lists/${id}`, {
                    method: "GET",
                });
                if (!getResponse.ok) throw new Error("Failed to create list");
                const list = await getResponse.json();

                setTasks(list.tasks);
                setListTitle(list.title);
                setLoading(false);

                setEditTitle(list.title)

            } catch (err) {
                console.error("There was an error loading the tasks, check logs", err);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [id]);
    
    // this hook allows user to scroll to latest task after adding
    useEffect(() => {
        // Scroll to the latest task
        if (justAddedRef.current && lastTaskRef.current) {
            lastTaskRef.current.scrollIntoView({ behavior: 'smooth' });
            // Makes sure to reset the reference point for next task added
            justAddedRef.current = false;
        }
    }, [tasks]);

    const handleDeleteTask = async (task: Task) => {
        if (!task?._id) return;
        try {
            await deleteTask(id, task._id); // API call to delete

            // Remove task from local state
            setTasks((prevTasks) => prevTasks.filter((t) => t._id?.toString() !== task._id?.toString()));

        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const deleteAllTasks = async (listId: string) => {
        const res = await fetch(`/api/todo-lists/${listId}/tasks`, {
            method: "DELETE",
        });

        if (!res.ok) {
            throw new Error("Failed to delete tasks");
        }
        // quick way to remove all tasks
        setTasks([]);
        return res.json();
    };

    const toggleTaskCompletion = async (task: Task) => {
        if (!task?._id) return;
        try {
            const updatedTaskRes = await updateTask(id, task._id, {
                completed: !task.completed,
                text: task.text,
                edited: true,
            });

            setTasks((prevTasks) => {
                return (
                    prevTasks.map( (t) => {
                        return (
                            t._id?.toString() === updatedTaskRes.task._id?.toString() ? updatedTaskRes.task : t
                        )
                    })
                )
                
            });

        } catch (err) {
            console.error(err);
        }
    };

    const addTask = async () => {
        if (!input.trim()) return;

        try {
            const response = await saveTask(input);
            const allTasks = response.tasks;
            const savedTask: Task = allTasks[allTasks.length - 1];

            justAddedRef.current = true;
            setTasks([...tasks, savedTask]);
            setInput('');
        } catch (err) {
            console.error("Failed to add task", err);
        }
    };

    // Prevent the form submission which causes a full page reload? Double check with Next JS
    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await addTask();
    };

    const handleAcceptTitleChange = async () => {
        try {
            const update = {
                taskListId: id,
                newTitle: editTitle
            };

            const titleChangeResponse = await fetch("/api/todo-lists/", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(update),
            });

            if (!titleChangeResponse.ok) throw new Error("There was an issue with changning the title");

            // setListTitle(editTitle);
            setIsEditingTitle(false);
            router.push(`/todo-lists/${id}/${toSlug(editTitle)}`);


        } catch (err) {
            console.error("There was an error changing the title", err);
        }
    };
    const handleCancelTitleChange = () => {
        setIsEditingTitle(false);
        setEditTitle(listTitle);
    };

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100vh-56px)]">
            <div className="flex justify-between items-center w-full">
                <PageHeader title="Task list"/>
            </div>

            {
                !isEditingTitle ?
                <button onClick={() => setIsEditingTitle(true)} className="m-3 font-bold flex justify-center w-full">{listTitle}</button>
                :
                <div className="m-3 flex items-center gap-2">
                    <input 
                        type="text" 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)} 
                        className="border border-solid border-mint-400 outline-0"
                        placeholder="change title"
                        required
                    />
                    <CheckIcon className="size-5 hover:text-mint-500 cursor-pointer" onClick={handleAcceptTitleChange}/>
                    <XMarkIcon className="size-5 hover:text-red-400 cursor-pointer" onClick={handleCancelTitleChange}/>
                </div>
            }

            <div className="w-[90%] md:w-2/3 flex items-center justify-between">
                <div className="flex items-center justify-between bg-slate-700 rounded drop-shadow-lg mx-3 w-full h-16">
                    <div className="p-2">Tasks completed: {""} / {""} </div>
                    <Modal  
                        mainButtonText="Delete all"
                        callback={() => deleteAllTasks(id)}
                        disabled={ false }
                        leftButtonText="Cancel"
                        rightButtonText="Delete all"
                        modalTitle="Delete all tasks"
                        modalDescription="This will permanently delete all your written tasks"
                        modalExtraDetails="Are you sure you want to delete all your tasks? Deleted tasks will not be retrievable."
                    />
                </div>
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
                                key={task._id?.toString()}
                                index={index}
                                deleteTask={() => handleDeleteTask(task)}
                                task={task} 
                                toggleTaskCompletion={toggleTaskCompletion}
                                openDetails={openDetails}
                                updateTask={() => console.log("null")}
                            />
                        )
                    })
                }
                </ul>
            }

            {selectedTask && (
                <DetailPanel
                    task={selectedTask}
                    onClose={closeDetails}
                />
            )}

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