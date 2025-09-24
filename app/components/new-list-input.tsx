"use client"
import { useState } from "react";
import Form from "next/form"

interface NewListInputProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewListInput = ({ setIsOpen }: NewListInputProps) => {

    const [inputText, setInputText] = useState<string>("");

    const onSubmitHandler = async () => {
        try {
            // Don't fetch if theres no title
            if (!inputText.length) return;

            const postResponse = await fetch("/api/todo-lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: inputText }),
            });

            console.log("+++ postResponse", postResponse);

            if (!postResponse.ok) throw new Error("Failed to create a new list");

            const newList = await postResponse.json();
            // setHref(`/todo-lists/${newList.id}/${newList.slug}`)
            console.log("+++ newList", newList);

        } catch (err) {
            console.error("There was an error creating the todolist, check logs", err);
        };
        
        setIsOpen(false);
    }

    return (
        <Form action="/workspaces" onSubmit={onSubmitHandler}>
            <input 
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full border border-solid rounded p-2"
                placeholder="Input a todolist title"
                required
            />

            <div className="flex gap-2">
                <button className="mt-4 p-2 text-sm bg-mint-900 hover:bg-mint-700 rounded cursor-pointer" onClick={onSubmitHandler}>
                    create
                </button>
                <button className="mt-4 p-2 text-sm bg-slate-600 hover:bg-slate-700 rounded cursor-pointer" onClick={() => setIsOpen(false)}>
                    cancel
                </button>
            </div>
        </Form>
    )

}