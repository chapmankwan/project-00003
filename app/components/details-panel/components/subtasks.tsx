import { useEffect, useRef, useState } from "react";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import { Types } from "mongoose";

import { useSubTaskApi } from "@/app/utilities/subTaskApiHooks";

interface SubTasksProps {
    listId: string;
    taskId: Types.ObjectId;
}

export const SubTasks = ({
    listId,
    taskId,
}: SubTasksProps) => {
    const { getSubTasks, saveSubTask, deleteSubTask } = useSubTaskApi(listId, taskId)
    
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

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const data = await getSubTasks();
            if (!data || cancelled) return;

            setSubTaskList(data.subTaskList);
            setSubTasksLoading(data.subTasksLoading);
        })();

        return () => {
            cancelled = true;
        };
    }, [getSubTasks]);
    
    const handleAddSubTask = async () => {
        try {
            const update = {
                text: subTaskInput,
                completed: false,
                order: subTaskList.length
            };

            const newSubTask = await saveSubTask(update)

            setSubTaskList(prev => [...prev, newSubTask]);
            setSubTaskInput("");

        } catch (err) {
            console.error("Failed to add subtask", err);
        };
    };

    const toggleSubTask = async (subTask: { _id: string; text: string; completed: boolean; }) => {

        // optimistic
        setSubTaskList(prev =>
            prev.map(st =>
            st._id === subTask._id
                ? { ...st, completed: !st.completed }
                : st
            )
        );

        try {
            const res = await fetch(
            `/api/todo-lists/${listId}/tasks/${taskId}/subtasks/${subTask._id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...subTask,
                    completed: true,
            }),
            }
            );

            if (!res.ok) throw new Error("Failed");
        } catch {
            // rollback only this subtask
            setSubTaskList(prev =>
            prev.map(st =>
                st._id === subTask._id
                ? subTask
                : st
            )
            );
        }
    };

    const handleDeleteSubTask = async (event: React.MouseEvent<HTMLButtonElement>, subTaskId: string) => {
        event.stopPropagation();
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
                    subTasksLoading && !subTaskList.length ? 
                    <p className="p-1">loading...</p>
                    :
                    subTaskList.map( (subTask, index) => (
                        <li 
                            key={subTask._id}
                            className={clsx("flex gap-2 cursor-pointer hover:bg-mono-600 border border-solid border-mono-400 px-2 py-1", index !== 0 && "border-t-0")}
                        >
                            <input 
                                checked={subTask?.completed}
                                onChange={() => toggleSubTask(subTask)}
                                type="checkbox" 
                            />
                            <span>{subTask?.text}</span>
                            <button 
                                onClick={(e) => handleDeleteSubTask(e, subTask._id)}
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