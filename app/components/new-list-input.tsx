"use client"
import { useEffect, useRef, useState } from "react";
import Form from "next/form"

interface NewListInputProps {  
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewListInput = ({ isDialogOpen, setIsDialogOpen }: NewListInputProps) => {

    const [inputText, setInputText] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect( () => {
        if(inputRef.current && isDialogOpen) {
            inputRef.current.focus();
        }
    }, [isDialogOpen])

    const onSubmitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            // Don't fetch if theres no title
            if (!inputText.length) return;

            const postResponse = await fetch("/api/todo-lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: inputText }),
            });

            if (!postResponse.ok) throw new Error("Failed to create a new list");
        } catch (err) {
            console.error("There was an error creating the todolist, check logs", err);
        };
        
        setIsDialogOpen(false)
    };

    const handleCancelButton = (event: React.MouseEvent<HTMLButtonElement>) => {
        // need this so the required portion of input doesn't do its thing
        event.preventDefault();
        setIsDialogOpen(false)
    };

    return (
        <Form action="/workspaces" onSubmit={onSubmitHandler}>
            <input 
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full border border-solid rounded p-2"
                placeholder="Input a todolist title"
                required
                ref={inputRef}
            />

            <div className="flex gap-2 items-center justify-end">
                <button className="mt-4 p-2 text-sm bg-mint-700 hover:bg-mint-800 rounded cursor-pointer" onClick={onSubmitHandler}>
                    create
                </button>
                <button className="mt-4 p-2 text-sm bg-blush-600 hover:bg-blush-700 rounded cursor-pointer" onClick={handleCancelButton}>
                    cancel
                </button>
            </div>
        </Form>
    )

}