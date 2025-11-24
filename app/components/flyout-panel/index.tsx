"use client"
import { useEffect, useState } from "react";

// import { Select } from '@headlessui/react'
// import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import Form from "next/form";

interface FlyoutPanelModel {
    callback?: () => void;
    onClose: () => void;
    onSubmit?: (payload: { text: string, priority?: string }) => Promise<void>;
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

    /* Priority List Selection */
    const priorityList = ["minor", "moderate", "major"];
    const [selectedPriority, setSelectedPriority] = useState<string>("moderate");
    const priorityButtonHandler = (event: React.FormEvent, priority: string) => {
        event.preventDefault();
        setSelectedPriority(priority);
    };

    let panelType = {
        cancelButton: "Cancel",
        submitButton: "Submit",
        panelTitle,
        firstInput: "First",
        description: "Description",
        showPriority: false,
    };

    switch (type) {
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
            };
            break;
        default:
            break;
    }
    
    useEffect(() => {
        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        // Animate out first, then unmount
        setIsVisible(false);
        setTimeout(onClose, 300); // match transition duration
    };

    const onSubmitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!titleInput.trim().length || !onSubmit) return;

        try {
            await onSubmit({
                text: titleInput,
            });
        } catch (err) {
            console.error("There was an error with handling the submit in the panel", err)
        }

        callback?.();
        onClose();
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
                "absolute bottom-0 left-0 right-0 z-50 bg-slate-800 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-300 ease-out h-fit",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="flex items-center justify-between p-6">
                    <button onClick={handleClose} className="cursor-pointer text-blush-500">{panelType.cancelButton}</button>
                    <h1 className="cursor-default">{panelType.panelTitle}</h1>
                    <button onClick={onSubmitHandler} className="cursor-pointer text-mint-500">{panelType.submitButton}</button>
                </div>

                <Form action="/workspaces" onSubmit={onSubmitHandler} className="p-6 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm">{panelType.firstInput}</span>
                        <input 
                            className="p-2 border border-solid border-lavender-400 rounded-md"
                            required 
                            type="text"
                            value={titleInput}
                            onChange={e => setTitleInput(e.target.value)}
                        />
                    </div>
                    {
                        panelType.description.length > 0 &&
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">{panelType.description}</span>
                            <textarea rows={5} className="p-2 border border-solid border-lavender-400 rounded-md h-50"/>
                        </div>
                    }
                    {/* <div className="flex flex-col gap-1">
                        <span className="text-sm">Due date</span>
                        <div className="p-2 w-fit bg-mint-700 rounded-md text-xs">
                            coming soon&#8482;...
                        </div>
                    </div> */}
                    <div className="flex flex-col">
                        <span className="text-sm">Priority</span>
                        <span className="text-xs">coming soon&#8482;...</span>

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
                                <ul className="relative flex items-center gap-2 w-full mx-auto bg-slate-600 px-2 py-2 rounded-md">
                                    {
                                        priorityList.map( priority => (
                                            <li 
                                                className={clsx(
                                                    "cursor-pointer text-center px-2 py-1 rounded-md flex-1 relative z-40 select-none",
                                                    selectedPriority === priority ? "text-slate-700" : "text-slate-100"
                                                )}
                                                key={priority}
                                                onClick={event => priorityButtonHandler(event, priority)}
                                            >
                                                {priority}
                                            </li>
                                        ))
                                    }
                                </ul>
                            }

                        </div>
                    </div>
                </Form>
            </div>
        </section>
    );
}
