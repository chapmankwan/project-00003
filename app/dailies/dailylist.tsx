"use client";
import { useEffect, useRef, useState } from "react";

import { DetailsPanel, FlyoutPanel, Loader, Todo } from "@/app/components";
// import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { Task } from "@/models/interfaces";

import Link from "next/link";
import { useRouter } from 'next/navigation';

import { ChevronLeftIcon } from "@heroicons/react/24/outline";

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
        console.log("+++ temp for drag, the api we use is still on todo-lists", event)
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

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            <section className="flex py-3 w-[85%] md:w-2/3 items-center">
                <button 
                    className="cursor-pointer mr-3 flex items-center"
                    onClick={() => router.back()}
                    title="back to collection"
                >
                        <ChevronLeftIcon className="size-5"/>
                </button>

                <button onClick={() => setIsEditingTitle(true)} className="font-bold cursor-default p-1">Dailies</button>

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
                                            deleteTask={() => console.log("+++ remove deleteTask Todo for Dailies")}
                                            task={task} 
                                            toggleTaskCompletion={toggleTaskCompletion}
                                            openDetails={openDetails}
                                            updateTask={() => console.log("+++ remove updateTask Todo for Dailies")}
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
                    deleteTask={() => console.log("+++ remove deleteTask in DetailsPanel")}
                    // Prevent updating task for dailies - can only be done on the templates section
                    listId={listId}
                />
            )}

            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    onClose={() => setIsFlyoutOpen(false)}
                    panelTitle="New Task"
                    type="todo"
                />
            }
        </div>
    );
};