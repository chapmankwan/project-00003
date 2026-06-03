"use client";
import { useEffect, useRef, useState } from "react";

import { DetailsPanel, FlyoutPanel, Loader, MoveableFab, Todo } from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { Task } from "@/models/interfaces";

import { useRouter } from 'next/navigation';

import { taskApiHooks } from "@/app/utilities/taskApiHooks";
import { toSlug } from "@/app/utilities";

import { CheckIcon, ChevronLeftIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export const TodoList = ({id}: { id:string }) => {
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

    const [collectionDetails, setCollectionDetails] = useState<{ name: string; id: string }>({
        name: "",
        id: "",
    });

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
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = tasks.findIndex(t => t._id.toString() === active.id);
            const newIndex = tasks.findIndex(t => t._id.toString() === over?.id);
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

                console.log("+++ fetched list", list);

                setTasks(list.tasks);
                setListTitle(list.title);
                setLoading(false);

                const getCollectionRes = await fetch(`/api/collections/${list.collectionId}`);
                if (!getCollectionRes.ok) throw new Error("Failed to fetch collection");
                const collectionData = await getCollectionRes.json();
                console.log("+++ fetched collection", collectionData);
                setCollectionDetails({ name: collectionData.name, id: collectionData._id });

                setEditTitle(list.title)

            } catch (err) {
                console.error("There was an error loading the tasks, check logs", err);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [id, listTitle]);
    
    // this hook allows user to scroll to latest task after adding
    useEffect(() => {
        // Only run this if a task was added
        if (!justAddedRef.current) return;
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
                edited: true,
            });
            // finalize from backend if necessary
            setTasks(prev =>
                prev.map(t => (t._id === updatedTaskRes._id ? updatedTaskRes : t))
            );

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

            setTasks(prev =>
                prev.map(t => (t._id === updatedTaskRes._id ? updatedTaskRes : t))
            );
        } catch (err) {
            console.error(err);
        }
    }

    const addTask = async (text:string, priority: string = "moderate", description?: string, dueDate?: string) => {
        if (!text.trim()) return;
        
        try {
            const order = tasks.length;
            const savedTask = await saveTask(text, priority , order, description, dueDate);

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
                        t._id?.toString() === updatedTaskRes?.task?._id?.toString() ? updatedTaskRes.task : t
                    )
                })
            )
        });
    };

    const handleDeleteAllButton = () => {
        if (window.confirm("Are you sure you want to delete all tasks from this list?")) { deleteAllTasks(id); }
        else return;
    }

    const CompletionCheck = () => {
        return (
            <span className="flex items-center gap-2 text-sm text-mint-500">
                {completedTasksCount} / {totalTasksCount}
            </span>
        )
    };

    return (
        <div className="flex-1 flex flex-col items-center h-[calc(100dvh-56px)]">
            <section className="flex pt-3 w-[85%] md:w-2/3 max-w-[85%] md:max-w-2/3 truncate">
                <button 
                    className="cursor-pointer mr-1"
                    onClick={() => router.push(`/collections/${collectionDetails.id}/${collectionDetails.name}`)}
                    title="back to collection"
                >
                        <ChevronLeftIcon className="size-5"/>
                </button>
                {   
                    !isEditingTitle ?
                    <div className="flex w-full">
                        <button onClick={() => setIsEditingTitle(true)} className="truncate font-bold cursor-text p-1">{listTitle}</button>

                    </div>
                    :
                    <div className="flex gap-2 items-center w-full">
                        <input 
                            ref={titleInputRef}
                            type="text" 
                            value={editTitle} 
                            onChange={e => setEditTitle(e.target.value)} 
                            className="border border-solid border-mint-400 rounded outline-0 p-1 w-full font-bold max-h-8"
                            placeholder="change title"
                            required
                        />
                        <CheckIcon className="size-6 hover:text-mint-500 cursor-pointer" onClick={handleAcceptTitleChange}/>
                        <XMarkIcon className="size-6 hover:text-red-400 cursor-pointer" onClick={handleCancelTitleChange}/>
                    </div>
                }
            </section>
            
            <section className="flex gap-2 items-center w-[85%] md:w-2/3 pb-3">
                <CompletionCheck />

                <div className="flex items-center gap-2 ml-auto">
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
                </div>
            </section>


            {
                loading ? 
                <Loader/> :
                <ul className={clsx(
                    "w-[85%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col rounded-md touch-pan-y scrollbar-soft",
                    isFlyoutOpen ? "transition-[max-height] max-h-[59dvh] duration-300 md:max-h-none" : "transition-[max-height] duration-300 max-h-[100dvh]"
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
                    listId={id}
                />
            )}

            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={({text, priority, description, dueDate} ) => addTask(text, priority, description, dueDate)}
                    panelTitle="New Task"
                    type="todo"
                />
            }
            <MoveableFab onClick={() => setIsFlyoutOpen(true)} />
        </div>
    );
};