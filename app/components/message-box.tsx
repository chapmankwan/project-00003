"use client"
import Form from "next/form";

interface MessageBoxModel {
    className?: string;
    addTask?: () => void;
    setNewTask: (task: string) => void;
}

export const MessageBox = ({
    addTask,
    setNewTask
}: MessageBoxModel) => {

    const onKeyDownHandler = () => {
        if (addTask) { return addTask(); }
    }

    return (
        <section className="sticky bottom-0 z-10 flex justify-center items-center w-full mx-auto p-4">
            <Form action="/todo-list" className="flex flex-col w-3/4 bg-mono-700 p-4 rounded-md">
                <input 
                    className="w-full border border-solid rounded"
                    name="messageBox"
                    onChange={ event => setNewTask(event.target.value)}
                    onKeyDown={onKeyDownHandler}
                    placeholder="Add a new task..."
                    type="textarea"
                />
            </Form>
        </section>
    )
}