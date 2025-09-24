"use client"
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, PageHeader, Loader, NewListInput } from "@/app/components";
import type { TodoListModel } from "@/models";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { PlusIcon } from "@heroicons/react/24/outline";


export default function Workspaces () {
    const { status } = useSession();
    const [allTaskLists, setAllTaskLists] = useState<TodoListModel[]>([])
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    if ( status === "unauthenticated" ) redirect("/");
    
    useEffect( () => {
        const fetchLists = async () => {
            const res = await fetch("/api/todo-lists");
            if (!res.ok) {
                console.error("Failed to fetch lists");
                return;
            }

            const list = await res.json();
            if (list.length) {
                setAllTaskLists(list.reverse());
                setLoading(false);
            }
        }

        fetchLists();
    },[]);

    const handleDelete = async (listId: string) => {
        try {
            const res = await fetch(`/api/todo-lists/${listId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete list");
            // optimistic update
            setAllTaskLists((prev) => prev.filter((list) => list._id !== listId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete list.");
        }
    };

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100vh-72px)]">
            <PageHeader title="Workspaces"/>
            <button
                onClick={() => setIsDialogOpen(true)} 
                className="sm:hidden w-12 h-12 flex items-center justify-center absolute bottom-4 right-4 p-2 m-2 cursor-pointer rounded-full bg-mint-700 hover:bg-mint-800"
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
                                <Card key={index} taskList={taskList} onDelete={handleDelete}/>
                            )
                        })
                    }
                </ul>
            }
            

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm space-y-4 bg-slate-500 p-4 rounded">
                        <DialogTitle className="font-bold text-lg">Input a title</DialogTitle>
                        <NewListInput setIsOpen={setIsDialogOpen} />
                    </DialogPanel>
                </div>
            </Dialog>
        </section>
    )
}