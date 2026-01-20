import { useEffect, useRef, useState } from "react";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import { Types } from "mongoose";

import { subTaskApiHooks } from "@/app/utilities/subTaskApiHooks";

interface SubTasksProps {
    listId: string;
    taskId: Types.ObjectId;
}

export const SubTasks = ({
    listId,
    taskId,
}: SubTasksProps) => {
    const { saveSubTask, deleteSubTask } = subTaskApiHooks(listId, taskId)
    
    const [subTasksLoading, setSubTasksLoading] = useState(true);
    const [subTaskList, setSubTaskList] = useState<{ _id: string; text: string; completed: boolean; }[]>([]);

    const [addingSubTask, setAddingSubTask] = useState(false);
    const [subTaskInput, setSubTaskInput] = useState("");

    const subTaskInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (subTaskInputRef.current) {
            subTaskInputRef.current.scrollIntoView({ behavior: 'smooth'});
            subTaskInputRef.current.focus();
        }
    },[addingSubTask]);

    useEffect( () => {
        const timer = setTimeout( async () => {
            try {
                const res = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}/subtasks`);

                if (!res.ok) throw new Error("Failed to get subtasks");
    
                const subTaskList = await res.json();
    
                setSubTaskList(subTaskList);
                setSubTasksLoading(false);
    
            } catch (err) {
                console.error("There was an error loading the tasks, check logs", err);
            }
        }, 1000);
        return () => clearTimeout(timer);
    
    }, [taskId, listId])
    
    const handleAddSubTask = async () => {
        try {
            const update = {
                text: subTaskInput,
                completed: false,
            };

            const newSubTask = await saveSubTask(update)

            setSubTaskList([...subTaskList, newSubTask])
            setSubTaskInput("");

        } catch (err) {
            console.error("Failed to add subtask", err);
        };
    };

    const toggleSubTaskCompletion =  async (subTask: {_id: string; completed: boolean}) => {
        if (!subTask) return;
        
        // Optimistic update visually
        setSubTaskList(prev =>
            prev.map((st) => 
                st._id === subTask._id
                    ? { ...st, completed: !subTask.completed, }
                    : st
            )
        );

        const res = await fetch(
            `/api/todo-lists/${listId}/tasks/${taskId}/subtasks/${subTask._id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    completed: !subTask.completed,
                }),
            }
        );

        if (!res.ok) throw new Error("Failed to update subtask");

        const updated = await res.json();

        setSubTaskList(prev =>
            prev.map(st => (st._id === updated._id ? updated : st))
        );
    };

    const handleDeleteSubTask = async (subTaskId: string) => {
        if (!subTaskId) return;

        try {
            await deleteSubTask(subTaskId);

            setSubTaskList( prevSubTasks => prevSubTasks.filter(st => st._id?.toString() !== subTaskId))
        } catch (err) {
            console.error("Error deleting subtask", err);
        };
    };

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && subTaskInput.length > 0 ) {
            handleAddSubTask();
        };
    };

    return (
        <div className="subtasks-container">
            <ul className="overflow-y-auto h-fit">
                <p className="">Subtasks: </p>
                {
                    subTasksLoading ? 
                    <p className="p-1">loading...</p>
                    :
                    subTaskList.map( (subTask, index) => (
                        <li 
                            key={index}
                            className={clsx("flex gap-2 cursor-pointer hover:bg-mono-600 border border-solid border-mono-400 px-2 py-1", index !== 0 && "border-t-0")}
                            onClick={() => toggleSubTaskCompletion(subTask)}
                        >
                            <input 
                                checked={subTask.completed}
                                onChange={() => toggleSubTaskCompletion(subTask)}
                                type="checkbox" 
                            />
                            <span>{subTask.text}</span>
                            <button 
                                onClick={() => handleDeleteSubTask(subTask._id)}
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
    )
}