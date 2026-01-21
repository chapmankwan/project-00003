import clsx from "clsx";

interface PriorityBoxProps {
    isEditing: boolean;
    selectedPriority: string;
    setSelectedPriority:  React.Dispatch<React.SetStateAction<string>>;
    priority: string;
}

const priorityList = ["minor", "moderate", "major"];

export const PriorityBox = ({
    isEditing,
    selectedPriority,
    setSelectedPriority,
    priority
}: PriorityBoxProps) => {

    const priorityButtonHandler = (priority: string) => {
        setSelectedPriority(priority);
    };
    
    return (
        <div className="flex gap-2 py-2 items-center">
            {
                isEditing ?
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
                        {priority ? priority : "none"}
                    </span>
                </div>
            }
        </div>
    )
}