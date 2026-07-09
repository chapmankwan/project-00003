"use client"
import { useEffect, useRef, useState } from "react";

import RecurrenceSelector from "../reccurence-selector";

import clsx from "clsx";
import Form from "next/form";

interface FlyoutPanelModel {
    callback?: () => void;
    onClose: () => void;
    onSubmit?: (payload: { text: string, priority: string, description?: string, recurrence?: string, dueDate?: string }) => Promise<void>;
    panelTitle: string;
    type: string;
};

export const FlyoutPanel =({
    callback,
    onClose,
    onSubmit,
    panelTitle,
    type="default",
}: FlyoutPanelModel) => {
    const [isVisible, setIsVisible] = useState(false);
    const [titleInput, setTitleInput] = useState<string>("");
    const titleInputRef = useRef<HTMLInputElement>(null);

    /* Priority List Selection */
    const priorityList = ["minor", "moderate", "major"];
    const [selectedPriority, setSelectedPriority] = useState<string>("moderate");
    const priorityButtonHandler = (event: React.MouseEvent | React.KeyboardEvent, priority: string) => {
        event.preventDefault();
        setSelectedPriority(priority);
    };

    const handlePriorityKeyDown = (event: React.KeyboardEvent, priority: string) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            priorityButtonHandler(event, priority);
        }
    };

    /** Due Date Selection */
    const [dueDate, setDueDate] = useState<string>("");

    const [description, setDescription] = useState<string>("");
    const [isAddMoreSelected, setIsAddMoreSelected] = useState(false);
    const [selectedRecurrence, setSelectedRecurrence] = useState<string>("");

    let panelType = {
        cancelButton: "Cancel",
        submitButton: "Submit",
        panelTitle,
        firstInput: "First",
        description: "Description",
        showPriority: false,
        showRecurrence: false,
        hasDueDate: false,
    };

    switch (type) {
        case 'collection':
            panelType = {
                ...panelType,
                submitButton: "Create",
                firstInput: "Collection name",
            };
            break;
        case 'todolist':
            panelType = {
                ...panelType,
                submitButton: "Create",
                firstInput: "Todolist Name",
                description: "",
                showPriority: true,
            };
            break;
        case 'todo':
            panelType = {
                ...panelType,
                submitButton: 'Add',
                firstInput: "Task",
                showPriority: true,
                hasDueDate: true,
            };
            break;
        case 'habit':
            panelType = {
                ...panelType,
                submitButton: 'Add',
                firstInput: "Habit",
                showPriority: true,
                showRecurrence: true,
            }
        default:
            break;
    }
    
    useEffect(() => {
        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 10);
        if (titleInputRef.current) titleInputRef.current.focus();
        return () => clearTimeout(timer);
    }, []);

    const handleClose = (force = false) => {
        // If not forced, and the form has been modified, confirm discard
        if (!force) {
            const hasChanges = (
                titleInput.trim().length > 0 ||
                description.trim().length > 0 ||
                dueDate.length > 0 ||
                selectedRecurrence.length > 0 ||
                isAddMoreSelected ||
                selectedPriority !== "moderate"
            );

            if (hasChanges) {
                const confirmDiscard = window.confirm("You have unsaved changes. Discard them?");
                if (!confirmDiscard) return;
            }
        }

        // Animate out first, then unmount
        setIsVisible(false);
        setTimeout(onClose, 300); // match transition duration
    };

	const handleResetAllStates = () => {
        setSelectedPriority("moderate");
		setTitleInput("");
		setDescription("");
	};

    const onSubmitHandler = async (event?: React.FormEvent | React.MouseEvent) => {
        event?.preventDefault();
        if (!titleInput.trim().length || !onSubmit) return;

        try {
            await onSubmit({
                text: titleInput,
                priority: selectedPriority,
                description: description,
                recurrence: selectedRecurrence.length > 0 ? selectedRecurrence : "",
                dueDate: dueDate.length > 0 ? dueDate : "",
            });
        } catch (err) {
            console.error("There was an error with handling the submit in the panel", err)
        }

        callback?.();
		handleResetAllStates();
        if (titleInputRef.current) titleInputRef.current.focus();
        if (!isAddMoreSelected) return handleClose(true);
    };

    const onKeyDownHandler = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            event.preventDefault();
            handleClose();
        }
    };

    return (
        <section className="fixed inset-0 z-40" onKeyDown={onKeyDownHandler}>
        {/* Backdrop */}
            <div
                className={clsx(
                "absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0"
                )}
                onClick={() => handleClose()}
            />

            {/* Flyout Panel */}
            <div
                className={clsx(
                "absolute z-50 bg-mono-800 shadow-2xl",
                // Mobile
                "bottom-0 right-0 left-0 rounded-t-2xl",
                "transform transition-transform duration-300 ease-out",
                // Desktop
                "md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[400px] md:rounded-none md:h-full",
                // Translation
                !isVisible ? "translate-y-full md:translate-y-0 md:translate-x-full"
                : "translate-y-0 md:translate-y-0 md:translate-x-0"
                )}
            >
                <div className="flex items-center justify-between p-6">
                    <button onClick={() => handleClose()} className="cursor-pointer text-blush-500">{panelType.cancelButton}</button>
                    <h1 className="cursor-default">{panelType.panelTitle}</h1>
                    <button onClick={onSubmitHandler} className="cursor-pointer text-mint-500">{panelType.submitButton}</button>
                </div>

                <Form action="/dailies/templates" onSubmit={onSubmitHandler} className="p-6 pt-0 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm">{panelType.firstInput}</span>
                        <input 
                            className="p-2 border border-solid border-lavender-400 rounded-md"
                            required 
                            type="text"
                            value={titleInput}
                            onChange={e => setTitleInput(e.target.value)}
                            ref={titleInputRef}
                        />
                    </div>
                    {
                        panelType.description.length > 0 &&
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">{panelType.description}</span>
                            <textarea rows={5} className="p-2 border border-solid border-lavender-400 rounded-md h-25" onChange={e => setDescription(e.target.value)} value={description}/>
                        </div>
                    }

                    {
                        panelType.showRecurrence ?
                            <RecurrenceSelector onChange={(rrule) => setSelectedRecurrence(rrule) }/>
                            :
                            null
                    }

                    {
                        panelType.hasDueDate &&
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">Due Date (optional)</span>
                            <input 
                                className="p-2 border border-solid border-lavender-400 rounded-md bg-mono-700"
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                    }

                    {
                        panelType.showPriority &&
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
                                {
                                    panelType.showPriority &&
                                    <div className="relative flex items-center gap-2 w-full mx-auto bg-mono-600 px-2 py-2 rounded-md" role="radiogroup" aria-label="Priority">
                                        {
                                            priorityList.map( priority => (
                                                <button
                                                    type="button"
                                                    className={clsx(
                                                        "cursor-pointer text-center px-2 py-1 rounded-md flex-1 relative z-40 select-none border border-transparent transition-colors",
                                                        selectedPriority === priority ? "text-mono-700 bg-lavender-300" : "text-mono-100 hover:bg-mono-500"
                                                    )}
                                                    key={priority}
                                                    onClick={event => priorityButtonHandler(event, priority)}
                                                    onKeyDown={event => handlePriorityKeyDown(event, priority)}
                                                    aria-pressed={selectedPriority === priority}
                                                >
                                                    {priority}
                                                </button>
                                            ))
                                        }
                                    </div>
                                }

                            </div>
                        </div>
                    }
					{
						(type === "todo" || type === "habit") &&
						<div className="flex gap-2 items-center text-sm">
							<input 
								className=""
								type="checkbox" 
								checked={isAddMoreSelected} 
								onChange={() => setIsAddMoreSelected(!isAddMoreSelected)}
							/>
							<span>Add additional tasks?</span>
						</div>
					}
                </Form>
            
                
            </div>
        </section>
    );
}
