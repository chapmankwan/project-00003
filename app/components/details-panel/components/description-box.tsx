interface DescriptionBoxProps {
    isEditing: boolean;
    descriptionInput: string;
    setDescriptionInput: React.Dispatch<React.SetStateAction<string>>;
    taskDescription: string;
}

export const DescriptionBox = ({
    isEditing,
    descriptionInput,
    setDescriptionInput,
    taskDescription,
}: DescriptionBoxProps) => {

    return (
        <div className="flex flex-col">
            <p className="font-bold">Description: </p>
            {
                isEditing && 
                <textarea rows={5} className="p-2 border border-solid border-mono-400 rounded-md h-50" value={descriptionInput} onChange={e => setDescriptionInput(e.target.value)}/>
            }
            {
                taskDescription 
                && taskDescription.length > 0 
                && !isEditing 
                && 
                <p className="border border-solid border-mono-500 p-2 rounded-md whitespace-pre-wrap">
                    {taskDescription}
                </p>
            }
        </div>
    )
}