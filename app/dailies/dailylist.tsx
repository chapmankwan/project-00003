"use client";
import { useEffect, useRef, useState } from "react";

import { DetailsPanel, FlyoutPanel, Loader, MoveableFab, Todo } from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { Task } from "@/models/interfaces";

import Link from "next/link";
import { useRouter } from 'next/navigation';

import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";

import {
    // arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export const DailyList = ({listId, initialTasks}: { listId:string, initialTasks?: Task[] }) => {

    const router = useRouter();

    // local states
    const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

    // Drag n Drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        console.log("+++ temp for drag, the api we use is still on todo-lists")
        // const { active, over } = event;
        // if (active.id !== over?.id) {
        //     const oldIndex = tasks.findIndex(t => t._id.toString() === active.id);
        //     const newIndex = tasks.findIndex(t => t._id.toString() === over?.id);
        //     const reordered = arrayMove(tasks, oldIndex, newIndex);
        //     setTasks(reordered);

        //     // sync to server
        //     fetch(`/api/todo-lists/${listId}/tasks/reorder`, {
        //         method: "PATCH",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({ orderedIds: reordered?.map(t => t._id.toString()) }),
        //     });
        // }
    };

    const openDetails = (task: Task) => setSelectedTask(task);
    const closeDetails = () => setSelectedTask(null);

    // references
    const justAddedRef = useRef(false);
    const lastTaskRef = useRef<HTMLLIElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialTasks) return setLoading(false);
    }, [initialTasks]);
    
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


            // Remove task from local state
            setTasks((prevTasks) => prevTasks.filter((t) => t._id?.toString() !== task._id?.toString()));

        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const deleteAllTasks = async () => {

        // quick way to remove all tasks
        setTasks([]);
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

        // try {
        //     // finalize from backend if necessary
        //     setTasks(prev =>
        //         prev.map(t => (t._id === updatedTaskRes._id ? updatedTaskRes : t))
        //     );

        // } catch (err) {
        //     console.error(err);
        // }
    };

    const handleEditTask = async (task: Task, text:string) => {
        if (!task?._id) return;
        console.log("+++ edited daily task", text);
        // try {
        //     const updatedTaskRes = await updateTask(id, task._id, {
        //         ...task,
        //         text,
        //         edited: true,
        //     });

        //     setTasks(prev =>
        //         prev.map(t => (t._id === updatedTaskRes._id ? updatedTaskRes : t))
        //     );
        // } catch (err) {
        //     console.error(err);
        // }
    }

    const addTask = async (text:string, priority: string = "moderate", description?: string) => {
        if (!text.trim()) return;
        
        try {
            const order = tasks.length;
            console.log("+++ temp save task", order, priority, description)
            // const savedTask = await saveTask(text, priority , order, description);
            const response = await fetch(`/api/daily/${listId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: text, priority: priority, order: order, description: description, }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save task: ${response.statusText}`);
            }

            const newTask = await response.json();

            justAddedRef.current = true;
            setTasks([...tasks, newTask]);
        } catch (err) {
            console.error("Failed to add task", err);
        }
    };

    const handleUpdateTask = async (task: Task, payload: { text: string, priority: string, description?: string}) => {
        const { text, priority, description } = payload
        // const updatedTaskRes = await updateTask(listId, task._id, {
        //     ...task,
        //     text: text,
        //     edited: true,
        //     description: description,
        //     priority: priority
        // });

        console.log("+++ this is to update the daily task", task, text, priority, description);

        // setTasks((prevTasks) => {
        //     return (
        //         prevTasks.map( (t) => {
        //             return (
        //                 t._id?.toString() === updatedTaskRes.task._id?.toString() ? updatedTaskRes.task : t
        //             )
        //         })
        //     )
        // });
    };

    const handleDeleteAllButton = () => {
        if (window.confirm("Are you sure you want to delete all dailies from this list?")) { deleteAllTasks(); }
        else return;
    }

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            <section className="flex py-3 w-[85%] md:w-2/3 items-center">
                <button 
                    className="cursor-pointer mr-3 flex items-center gap-2"
                    onClick={() => router.back()}
                    title="back to collection"
                >
                        <ChevronLeftIcon className="size-5"/> back
                </button>

                <button onClick={() => setIsEditingTitle(true)} className="font-bold cursor-default p-1">Dailies</button>
                {/* <div className="flex items-center gap-2 ml-auto">
                    <Menu>
                        <MenuButton 
                            className="inline-flex p-1 rounded cursor-pointer bg-mono-500 hover:bg-mono-400"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <TrashIcon className="size-5"/>
                        </MenuButton>

                        <MenuItems
                            transition
                            anchor="left"
                            className="bg-mono-700 rounded-md"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <MenuItem>
                                <button 
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:text-red-500"
                                    onClick={handleDeleteAllButton}
                                >
                                    delete all tasks
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                </div> */}

                <Link href="/dailies/templates" className="px-3 py-1 ml-auto bg-mint-700 rounded-md">
                    to daily templates
                </Link>
            </section>


            {
                loading ? 
                <Loader/> :
                <ul className={clsx(
                    "w-[85%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col rounded-md touch-pan-y scrollbar-soft",
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
                                            isLast={isLast}
                                        />
                                    )
                                })
                            }
                        </SortableContext>
                    </DndContext>
                </ul>
            }

            {selectedTask && (
                <DetailsPanel
                    task={tasks.find( t => t._id === selectedTask._id ) || selectedTask}
                    onClose={closeDetails}
                    deleteTask={() => handleDeleteTask(selectedTask)}
                    updateTask={({text, priority, description}) => handleUpdateTask(selectedTask, {text, priority, description})}
                    listId={listId}
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
            <MoveableFab onClick={() => setIsFlyoutOpen(true)} />
        </div>
    );
};