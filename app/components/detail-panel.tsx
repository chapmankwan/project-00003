"use client"
import { useEffect, useRef, useState } from "react";

import { Task } from "@/models";

import { CheckIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import { Types } from "mongoose";

interface DetailPanelModel {
    deleteTask: (taskId: Types.ObjectId) => void;
    task: Task;
    onClose: () => void;
    updateTask: (payload: {
        text: string,
        priority: string,
        description?: string
    }) => Promise<void>;
};

export const DetailPanel =({
    deleteTask,
    task,
    onClose,
    updateTask,
}: DetailPanelModel) => {

    const [isVisible, setIsVisible] = useState(false);
    const [addingSubTask, setAddingSubTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState(task.text);

    const [subTaskList, setSubTaskList] = useState<{ _id: string; text: string; completed: boolean; }[]>([]);
    const [subTaskInput, setSubTaskInput] = useState("");

    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editTaskInput, setEditTaskInput] = useState("");

        /* Priority List Selection */
    const priorityList = ["minor", "moderate", "major"];
    const [selectedPriority, setSelectedPriority] = useState<string>(task.priority);
    const priorityButtonHandler = (priority: string) => {
        setSelectedPriority(priority);
    };

    const subTaskInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (subTaskInputRef.current) {
            subTaskInputRef.current.scrollIntoView({ behavior: 'smooth'});
            subTaskInputRef.current.focus();
        }
    },[addingSubTask]);

    const handleAddSubTask = () => {
        if (subTaskInput.length > 0) {
            const newSubTask = {
                _id: `${subTaskInput}`,
                text: subTaskInput,
                completed: false,
            };

            setSubTaskList([...subTaskList, newSubTask]);
            // reset input after adding a subTask
            setSubTaskInput("");
        }
    };

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && subTaskInput.length > 0 ) {
            handleAddSubTask();
        };
    };
    
    useEffect(() => {
        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setEditTaskInput(task.text);
    }, [task])

    const handleClose = () => {
        // Animate out first, then unmount
        setIsVisible(false);
        setTimeout(onClose, 300); // match transition duration
    };

    const handleDeleteTask = () => {
        deleteTask(task._id);
        handleClose();
    };

    const handleUpdateSubtask = (subTaskId: string) => {
        setSubTaskList( (prevList) => {
            return (
                prevList.map( subTask => {
                    return (
                        subTask._id === subTaskId ? {...subTask, completed: !subTask.completed} : subTask
                    )
                })
            )
        })
    };

    const handleRemoveSubTask = (event: React.MouseEvent<HTMLButtonElement>, subTaskId: string) => {
        event.stopPropagation();
        setSubTaskList(subTaskList.filter( subTask => subTask._id !== subTaskId));
    };

    const handleEditTask = () => {
        updateTask({text: editTaskInput, priority: selectedPriority})
        setTaskTitle(task.text);
        setIsEditingTask(false);
    }

    return (
        <section className="fixed inset-0 z-40">
        {/* Backdrop */}
            <div
                className={clsx(
                "absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Flyout Panel */}
            <div
                className={clsx(
                "absolute bottom-0 left-0 right-0 z-50 bg-mono-800 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-300 ease-out max-h-[75dvh]",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-mint-500/20">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <button onClick={handleClose} className="cursor-pointer text-mint-400 hover:text-mint-200">
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <div className="flex flex-col p-4 max-h-[calc(75dvh-61px)] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        {
                            !isEditingTask ?
                            <button 
                                onClick={() => setIsEditingTask(!isEditingTask)} 
                                className="m-0 h-[50px] pr-2 font-bold text-lavender-400 flex-wrap items-start cursor-text hover:text-lavender-500"
                            >
                                Task: {taskTitle}
                            </button>
                            :
                            <div className="flex p-2 gap-2 items-center w-11/12">
                                <input 
                                    className="w-full border border-solid border-mono-400 rounded p-1"
                                    type="text" 
                                    value={editTaskInput} 
                                    onChange={e => setEditTaskInput(e.target.value)}
                                />
                                <CheckIcon onClick={handleEditTask} className="size-5 hover:text-mint-500 cursor-pointer"/>
                                <XMarkIcon onClick={() => setIsEditingTask(false) } className="size-5 hover:text-red-400 cursor-pointer"/>
                            </div>
                        }

                        {/* Close details panel button */}
                        <button 
                            className="flex items-center w-fit border-0 cursor-pointer text-mono-50 bg-red-500 hover:bg-red-700 rounded p-2 gap-2"
                            onClick={handleDeleteTask}
                            title="delete"
                        >
                            <TrashIcon className="size-5"/>
                        </button>
                    </div>
                    <p className="m-0 py-2">Date created: {task.date}</p>

                    <p className="m-0 py-2">Completed: {task.completed ? "Finished" : "Not yet complete"}</p>
                    <div className="flex gap-2 py-2 items-center">
                        <p>Urgency:</p>
                        {task.priority ? task.priority : "none"}
                    </div>
                    {task.edited ? "edited" : ""}
                    <div className="subtask container">
                        <ul className="overflow-y-auto h-fit">
                            <p className="">Subtasks: </p>
                            {
                                subTaskList.map( (subTask, index) => (
                                    <li 
                                        key={index}
                                        className={clsx("flex gap-2 cursor-pointer hover:bg-mono-600 border border-solid border-mono-400 px-2 py-1", index !== 0 && "border-t-0")}
                                        onClick={() => handleUpdateSubtask(subTask._id)}
                                    >
                                        <input 
                                            checked={subTask.completed}
                                            onChange={() => handleUpdateSubtask(subTask._id)}
                                            type="checkbox" 
                                        />
                                        <span>{subTask.text}</span>
                                        <button 
                                            onClick={(event) => handleRemoveSubTask(event, subTask._id)}
                                            className="ml-auto text-red-500 cursor-pointer"
                                        >
                                            <XMarkIcon className="size-4"/>
                                        </button>
                                    </li>
                                ))
                            }

                        </ul>

                        <div className="flex gap-2 py-2 items-center w-full">
                            {
                                !addingSubTask ?
                                <button className="p-1 cursor-pointer hover:bg-lavender-500 bg-lavender-600 rounded" onClick={() => setAddingSubTask(true)}>
                                    create subtask
                                </button>
                                :
                                <>
                                    <input 
                                        ref={subTaskInputRef}
                                        className="border rounded w-full border-solid p-1"
                                        type="text"
                                        value={subTaskInput}
                                        onChange={e => setSubTaskInput(e.target.value)}
                                        placeholder="Add a new subtask"

                                        onKeyDown={keyDownHandler}
                                    />
                                    <button 
                                        onClick={handleAddSubTask}
                                        className="cursor-pointer text-mint-500"
                                    >
                                        <PlusIcon className="size-5"/>
                                    </button>
                                    <button className="cursor-pointer text-red-500" onClick={() => setAddingSubTask(false)}><XMarkIcon className="size-5"/></button>
                                </>
                            }
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-sm">Priority</span>
                        <div className="w-full relative">
                            <div
                                className={clsx(
                                    "absolute z-40 top-1/2 -translate-y-1/2 h-[70%] w-[80%] rounded-md bg-lavender-400 transition-all duration-300 ease-out",
                                )}
                                style={{
                                    width: `${(100 / priorityList.length) * 0.8}%`,
                                    left: `${priorityList.indexOf(selectedPriority) * (100 / priorityList.length) + (100 / priorityList.length) * 0.1}%`, 
                                }}
                            />
                            <ul className="relative flex items-center gap-2 w-full mx-auto bg-mono-600 px-2 py-2 rounded-md">
                                {
                                    priorityList.map( priority => (
                                        <li 
                                            className={clsx(
                                                "cursor-pointer text-center px-2 py-1 rounded-md flex-1 relative z-40 select-none",
                                                selectedPriority === priority ? "text-mono-700" : "text-mono-100"
                                            )}
                                            key={priority}
                                            onClick={()=> priorityButtonHandler(priority)}
                                        >
                                            {priority}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
