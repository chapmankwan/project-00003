"use client"
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, PageHeader, Loader, NewListInput, FlyoutPanel } from "@/app/components";
import type { TodoListModel } from "@/models";
import { Dialog, DialogPanel } from '@headlessui/react';
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Workspaces () {
    const { status } = useSession();
    const [allTaskLists, setAllTaskLists] = useState<TodoListModel[]>([])
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTaskListId, setSelectedTaskListId] = useState("");

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

    const createNewRef = useRef<HTMLButtonElement>(null)
    
    if ( status === "unauthenticated" ) redirect("/");
    
    const fetchLists = async () => {
        const res = await fetch("/api/todo-lists");
        if (!res.ok) {
            console.error("Failed to fetch lists");
            return;
        }

        const list = await res.json();
        if (list.length) {
            setAllTaskLists(list.reverse());
        }
    };

    useEffect( () => {
        // Only fetch for initial mount
        fetchLists().finally(() => setLoading(false));
    },[]);
    
    useEffect(() => {
        // only focus on the create new button if there are no tasklists
        if( createNewRef.current && !(allTaskLists.length > 0)) createNewRef.current.focus();
    }, [allTaskLists])

    const handleDelete = async (listId: string) => {
        if (!listId.length) return;
        try {
            const res = await fetch(`/api/todo-lists/${listId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete list");
            // optimistic update
            setAllTaskLists((prev) => prev.filter((list) => list._id !== listId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete list.");
        };
        setIsDeleteDialogOpen(false);
    };

    const handleCreateTodolist = async (text: string, priority: string = "moderate") => {

        try {
            // Don't fetch if theres no title
            if (!text.length) return;

            const postResponse = await fetch("/api/todo-lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: text, priority }),
            });

            if (!postResponse.ok) throw new Error("Failed to create a new list");
        } catch (err) {
            console.error("There was an error creating the todolist, check logs", err);
        };
    }

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            <PageHeader title="Workspaces"/>
            <button
                ref={createNewRef}
                // onClick={() => setIsDialogOpen(true)} 
                onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                className="
                    sm:hidden w-12 h-12 
                    flex items-center justify-center 
                    absolute bottom-4 right-4 p-2 m-2 
                    cursor-pointer rounded-full 
                    bg-mint-700 hover:bg-mint-800
                    data-focus:outline data-focus:outline-white data-hover:bg-black/30
                "
            >
                <PlusIcon className="size-6"/>
            </button>
            {
                loading ? 
                <Loader /> :
                <ul className="space-y-2 w-[90%] lg:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto">
                    {
                        allTaskLists.length > 0 &&
                        allTaskLists.map( (taskList, index) => {
                            return (
                                <Card key={index} taskList={taskList} setIsDeleteDialog={setIsDeleteDialogOpen} setSelectedTaskListId={setSelectedTaskListId} />
                            )
                        })
                    }
                </ul>
            }

            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    // use this to refetch after creating a new list
                    callback={fetchLists}
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={ ({ text, priority }) => handleCreateTodolist( text, priority )}
                    panelTitle="New Workspace"
                    type="todolist"
                />
            }

            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} className="relative z-50 duration-300 ease-out data-closed:opacity-0" transition>
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm space-y-4 bg-slate-700 p-4 rounded backdrop-blur-2xl items-center">
                        <p>Do you want to delete this todolist?</p>
                        <div className="flex gap-2">
                            <button onClick={() => setIsDeleteDialogOpen(false)} className="p-2 bg-mint-500 hover:bg-mint-700 rounded cursor-pointer">cancel</button>
                            <button onClick={() => handleDelete(selectedTaskListId)}className="p-2 bg-red-500 hover:bg-red-700 rounded cursor-pointer">delete</button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>


            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50 duration-300 ease-out data-closed:opacity-0" transition>
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm space-y-4 bg-slate-700 p-4 rounded backdrop-blur-2xl">
                        <NewListInput isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} fetchLists={fetchLists} />
                    </DialogPanel>
                </div>
            </Dialog>
        </section>
    )
}