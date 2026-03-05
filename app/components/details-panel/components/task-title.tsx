import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TaskTitleProps {
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    setEditTaskInput: React.Dispatch<React.SetStateAction<string>>;
    taskTitle: string;
    editTaskInput: string;
    deleteTask: () => void;
};

export const TaskTitle = ({
    isEditing,
    setIsEditing,
    setEditTaskInput,
    editTaskInput,
    taskTitle,
    deleteTask
}: TaskTitleProps) => {

    return (
        <div className="flex items-center justify-between h-[50px]">
            {
                !isEditing ?
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
                    onClick={() => setIsEditing(!isEditing)}
                    title="edit"
                >
                    <PencilSquareIcon className="size-5"/>
                </button>
                <button 
                    className="w-fit border-0 cursor-pointer text-mono-50 bg-red-500 hover:bg-red-700 rounded p-2"
                    onClick={deleteTask}
                    title="delete"
                >
                    <TrashIcon className="size-5"/>
                </button>
            </div>
        </div>
    )
}