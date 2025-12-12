"use client"
import { useEffect, useRef, useState } from "react";

import { Task } from "@/models";

import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    const [descriptionInput, setDescriptionInput] = useState(task.description || "")

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
        let description;
        if (descriptionInput.length) {
            description = descriptionInput;
        }
        updateTask({text: editTaskInput, priority: selectedPriority, description});
        console.log("+++ taskTitle", taskTitle);
        setTaskTitle(editTaskInput);
        setIsEditingTask(false);
    };

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
                "transform transition-transform duration-300 ease-out min-h-[50dvh] max-h-[75dvh]",
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
                    <div className="flex items-center justify-between h-[50px]">
                        {
                            !isEditingTask ?
                            <p className="pr-2 h-font-bold text-lavender-400 flex-wrap items-center">
                                Task: {taskTitle}
                            </p>
                            :
                            <div className="flex p-2 pl-0 gap-2 items-center w-11/12">
                                <input 
                                    className="w-full border border-solid border-mono-400 rounded p-1"
                                    type="text" 
                                    value={editTaskInput} 
                                    onChange={e => setEditTaskInput(e.target.value)}
                                />
                            </div>
                        }

                        <div className="flex gap-1">
                            <button
                                className="w-fit border-0 cursor-pointer text-mono-50 bg-mono-400 hover:bg-mono-600 rounded p-2"
                                onClick={() => setIsEditingTask(!isEditingTask)}
                                title="edit"
                            >
                                <PencilSquareIcon className="size-5"/>
                            </button>
                            <button 
                                className="w-fit border-0 cursor-pointer text-mono-50 bg-red-500 hover:bg-red-700 rounded p-2"
                                onClick={handleDeleteTask}
                                title="delete"
                            >
                                <TrashIcon className="size-5"/>
                            </button>
                        </div>
                    </div>

                    <p className="text-mint-400 text-xs">{task.edited ? "edited" : ""}</p>

                    <div className="flex">
                        <p className="font-bold">Date created: </p>
                        <p className="ml-1">{task.date}</p>
                    </div>

                    <div className="flex">
                        <p className="font-bold">Progress: </p>
                        <p className="ml-1">{task.completed ? "All work completed" : "In progress"}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold">Description: </p>
                        {
                            isEditingTask && 
                            <textarea rows={5} className="p-2 border border-solid border-mono-400 rounded-md h-50" value={descriptionInput} onChange={e => setDescriptionInput(e.target.value)}/>
                        }
                        {
                            task.description && task.description.length > 0 && !isEditingTask &&
                            <p className="border border-solid border-mono-500 p-2 rounded-md whitespace-pre-wrap">{task.description}</p>
                        }
                    </div>

                    <div className="flex gap-2 py-2 items-center">
                        {
                            isEditingTask ?
                            <div className="flex flex-col gap-1 w-full">
                                <span className="font-bold">Priority: </span>
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
                            :
                            <div className="flex">
                                <p className="font-bold">Priority: </p> 
                                <span className="ml-1 ">
                                    {task.priority ? task.priority : "none"}
                                </span>
                            </div>
                        }
                    </div>

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

                        {/* Bottom to save */}
                        {
                            isEditingTask ?
                            <div className="flex justify-end gap-1">
                                <button 
                                    onClick={handleEditTask} 
                                    className="flex items-center cursor-pointer rounded bg-mint-400 hover:bg-mint-500 px-2 py-1.5"
                                >
                                    <span>Save</span>
                                </button>
                                <button 
                                    onClick={() => setIsEditingTask(false) } 
                                    className="flex items-center cursor-pointer rounded bg-red-500 hover:bg-red-400 px-2 py-1.5"
                                >
                                    <span>Cancel</span>
                                </button>
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
            </div>
        </section>
    );
}
