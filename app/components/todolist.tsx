"use client";
import { useEffect, useRef, useState } from "react";

import { DetailPanel, FlyoutPanel, Loader, Modal, Todo } from "@/app/components";
import type { Task } from "@/models";

import { useRouter } from 'next/navigation';

import { taskApiHooks } from "@/app/utilities/taskApiHooks";
import { toSlug } from "@/app/utilities";

import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export const TodoList = ({id}: { id:string}) => {
    const { saveTask, updateTask, deleteTask } = taskApiHooks(id);

    const router = useRouter();

    // local states
    const [tasks, setTasks] = useState<Task[]>([]);
    const [listTitle, setListTitle] = useState("")
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState("");

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

    // drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor),
    );

    // ** FIX TYPESCRIPT **
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = tasks.findIndex(t => t._id.toString() === active.id);
            const newIndex = tasks.findIndex(t => t._id.toString() === over.id);
            const reordered = arrayMove(tasks, oldIndex, newIndex);
            setTasks(reordered);

            // sync to server
            fetch(`/api/todo-lists/${id}/tasks/reorder`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: reordered?.map(t => t._id.toString()) }),
            });
        }
    }

    const openDetails = (task: Task) => setSelectedTask(task);
    const closeDetails = () => setSelectedTask(null);

    // references
    const justAddedRef = useRef(false);
    const lastTaskRef = useRef<HTMLLIElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

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
        const timer = setTimeout(() => {
            if (isFlyoutOpen && lastTaskRef.current) {
                lastTaskRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                // Makes sure to reset the reference point for next task added
                justAddedRef.current = false;
            }
        }, 300);
        
        return () => clearTimeout(timer)
    }, [tasks, isFlyoutOpen]);

    useEffect(() => {
        if( titleInputRef.current ) titleInputRef.current.focus();
    },[isEditingTitle])

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

        // Optimistic update visually
        setTasks((prev) =>
            prev.map((t) =>
                t._id === task._id
                    ? { ...t, completed: !task.completed, edited: true }
                    : t
            )
        );

        try {
            // send update to server
            const updatedTaskRes = await updateTask(id, task._id, {
                ...task,
                completed: !task.completed,
                text: task.text,
                edited: true,
            });
            // finalize from backend if necessary
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

    const handleEditTask = async (task: Task, text:string) => {
        if (!task?._id) return;
        try {
            const updatedTaskRes = await updateTask(id, task._id, {
                ...task,
                text,
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
    }

    const addTask = async (text:string, priority: string = "moderate", description?: string) => {
        if (!text.trim()) return;
        
        try {
            const order = tasks.length;
            const response = await saveTask(text, priority , order, description);
            const allTasks = response.tasks;
            const savedTask: Task = allTasks[allTasks.length - 1];

            justAddedRef.current = true;
            setTasks([...tasks, savedTask]);
        } catch (err) {
            console.error("Failed to add task", err);
        }
    };

    const handleAcceptTitleChange = async () => {
        if (editTitle === listTitle) return setIsEditingTitle(false);
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

    const totalTasksCount = tasks?.length;
    const completedTasksCount = tasks?.filter( task => task.completed )?.length;

    const handleUpdateTask = async (task: Task, payload: { text: string, priority: string, description?: string}) => {
        const { text, priority, description } = payload
        const updatedTaskRes = await updateTask(id, task._id, {
            ...task,
            text: text,
            edited: true,
            description: description,
            priority: priority
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
    };

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            {
                !isEditingTitle ?
                <button onClick={() => setIsEditingTitle(true)} className="p-4 font-bold flex w-[90%] md:w-2/3 cursor-text">{listTitle}</button>
                :
                <div className="p-3 flex gap-2 items-center w-[90%] md:w-2/3">
                    <input 
                        ref={titleInputRef}
                        type="text" 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)} 
                        className="border border-solid border-mint-400 rounded outline-0 p-1 w-full"
                        placeholder="change title"
                        required
                    />
                    <CheckIcon className="size-5 hover:text-mint-500 cursor-pointer" onClick={handleAcceptTitleChange}/>
                    <XMarkIcon className="size-5 hover:text-red-400 cursor-pointer" onClick={handleCancelTitleChange}/>
                </div>
            }

            <div className="w-[90%] md:w-2/3 flex items-center justify-between">
                <div className="flex items-center justify-between bg-mono-700 rounded drop-shadow-lg mx-3 w-full h-14">
                    <div className="m-3 text-sm">Completed: {completedTasksCount} / {totalTasksCount} </div>
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
                <ul className={clsx(
                    "w-[90%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col gap-1.5",
                    "[&::-webkit-scrollbar]:w-2",
                    "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-mono-300",
                    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mint-600",
                    "ease-in-out",
                    isFlyoutOpen ? "transition-[max-height] max-h-[47dvh] duration-300 md:max-h-none" : "transition-[max-height] duration-300 max-h-[100dvh]"
                    )}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={tasks.map(t => t._id.toString())} strategy={verticalListSortingStrategy}>
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
                                            updateTask={handleEditTask}
                                        />
                                    )
                                })
                            }
                        </SortableContext>
                    </DndContext>
                </ul>
            }

            {selectedTask && (
                <DetailPanel
                    task={tasks.find( t => t._id === selectedTask._id ) || selectedTask}
                    onClose={closeDetails}
                    deleteTask={() => handleDeleteTask(selectedTask)}
                    updateTask={({text, priority, description}) => handleUpdateTask(selectedTask, {text, priority, description})}
                />
            )}

            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={({text, priority, description} ) => addTask(text, priority, description)}
                    panelTitle="New Task"
                    type="todo"
                />
            }

            <button
                // ref={createNewRef}
                onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                className="
                    w-12 h-12 
                    flex items-center justify-center 
                    absolute bottom-4 right-4 p-2 m-2 
                    cursor-pointer rounded-full 
                    bg-mint-500 hover:bg-mint-600
                    drop-shadow-lg
                    data-focus:outline data-focus:outline-white data-hover:bg-black/30
                "
            >
                <PlusIcon className="size-6"/>
            </button>
        </div>
    );
};