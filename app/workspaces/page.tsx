"use client"
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, PageHeader, Loader } from "@/app/components";
import type { TodoListModel } from "@/models";



export default function Workspaces () {
    const { status } = useSession();
    const [allTaskLists, setAllTaskLists] = useState<TodoListModel[]>([])
    const [loading, setLoading] = useState(true);
    

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
        </section>
    )
}