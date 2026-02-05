"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Card, PageHeader, Loader, FlyoutPanel, MoveableFab } from "@/app/components";
import type { TodoListModel } from "@/models/interfaces";

import { Dialog, DialogPanel } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";


export default function Collections () {
    const params = useParams<{id: string, name: string}>();
    const { status } = useSession();

    const router = useRouter();
    
    const [allTaskLists, setAllTaskLists] = useState<TodoListModel[]>([])
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTaskListId, setSelectedTaskListId] = useState("");
    const [collectionName, setCollectionName] = useState(params.name);

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

    const [isEditingCollectionName, setIsEditingCollectionName] = useState(false);
    const [editCollectionName, setEditCollectionName] = useState(decodeURIComponent(params.name));;

    const createNewRef = useRef<HTMLButtonElement>(null)
    const collectionNameInputRef = useRef<HTMLInputElement>(null);
    
    if ( status === "unauthenticated" ) redirect("/");
    
    const fetchLists = useCallback(async () => {
        const res = await fetch(`/api/todo-lists?collectionId=${params.id}`);
        if (!res.ok) {
            console.error("Failed to fetch lists");
            return;
        }

        const collection = await res.json();
        if (!collection ) return;

        const todoLists = collection.todoLists;

        if (todoLists.length) {
            setAllTaskLists(todoLists.reverse());
        }
    }, [params.id]);

    useEffect( () => {
        // Only fetch for initial mount
        fetchLists();
        const timer = setTimeout( () => setLoading(false), 500 );

        return () => clearTimeout(timer);
    },[fetchLists]);
    
    useEffect(() => {
        // only focus on the create new button if there are no tasklists
        if( createNewRef.current && !(allTaskLists.length > 0)) createNewRef.current.focus();
    }, [allTaskLists])

    useEffect(() => {
        if( collectionNameInputRef.current ) collectionNameInputRef.current.focus();
    },[isEditingCollectionName])

    const handleDelete = async (listId: string) => {
        if (!listId.length) return;
        try {
            const res = await fetch(`/api/todo-lists/${listId}?collectionId=${params.id}`, { method: "DELETE" });
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
                body: JSON.stringify({ title: text, priority, collectionId: params.id }),
            });

            if (!postResponse.ok) throw new Error("Failed to create a new list");
        } catch (err) {
            console.error("There was an error creating the todolist, check logs", err);
        };
    };

    const duplicateTaskHandler = async (listId: string) => {

        const res = await fetch(`/api/todo-lists/${listId}/duplicate`, {
            method: "POST",
        });

        if (!res.ok) throw new Error("Failed to duplicate list");

        const newList = await res.json();

        setAllTaskLists(prev => [newList, ...prev]);
    };

    const handleDuplicateButton = (event: React.MouseEvent<HTMLButtonElement>, listId: string) => {
        event.stopPropagation();
        event.preventDefault();

        duplicateTaskHandler(listId);
    };

    const handleAcceptCollectionNameChange = async () => {
        if (editCollectionName === params.name || !editCollectionName.length) return setIsEditingCollectionName(false);
        try {
            const update = {
                id: params.id,
                newCollectionName: editCollectionName
            };

            const collectionNameChangeResponse = await fetch("/api/collections/", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(update),
            });

            if (!collectionNameChangeResponse.ok) throw new Error("There was an issue with changing the collection name");

            setCollectionName(update.newCollectionName);
            router.push(`/collections/${params.id}/${editCollectionName}`);
        } catch (err) {
            console.error("There was an error with changing the collection name", err);
        }
        setIsEditingCollectionName(false);
    }

    const handleCancelCollectionNameChange = () => {
        setIsEditingCollectionName(false);
        setEditCollectionName(decodeURIComponent(params.name));
    };

    const handleEditCollectionNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'Enter':
                handleAcceptCollectionNameChange();
                break;
            case 'Escape': 
                handleCancelCollectionNameChange();
                break;
        };
    }

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            {
                !isEditingCollectionName ?
                <PageHeader onClick={() => setIsEditingCollectionName(true)} title={`Collection: ${decodeURIComponent(collectionName)}`}/> :
                <div className="flex gap-2 items-center w-full px-7 py-5 max-h-[72px]">
                    <input 
                        ref={collectionNameInputRef}
                        className="border border-solid border-mint-400 rounded outline-0 m-0 p-1 w-full font-bold text-xl"
                        type="text"
                        value={editCollectionName}
                        onChange={e => setEditCollectionName(e.target.value)}
                        placeholder="change collection name"
                        required
                        onKeyDown={handleEditCollectionNameKeyDown}
                    />
                    <CheckIcon className="size-6 hover:text-mint-500 cursor-pointer" onClick={handleAcceptCollectionNameChange}/>
                    <XMarkIcon className="size-6 hover:text-red-400 cursor-pointer" onClick={handleCancelCollectionNameChange}/>
                </div>
            }

            <MoveableFab onClick={() => setIsFlyoutOpen(!isFlyoutOpen)} />
            {
                loading ? 
                <Loader /> :
                <ul className="space-y-2 w-[90%] lg:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto touch-pan-y scrollbar-soft">
                    {
                        allTaskLists.length > 0 &&
                        allTaskLists.map( (taskList, index) => {
                            return (
                                <Card 
                                    key={index} 
                                    taskList={taskList} 
                                    setIsDeleteDialog={setIsDeleteDialogOpen} 
                                    setSelectedTaskListId={setSelectedTaskListId} 
                                    duplicateTask={e => handleDuplicateButton(e, taskList._id)}
                                />
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
                    <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm space-y-4 bg-mono-700 p-4 rounded backdrop-blur-2xl items-center">
                        <p>Do you want to delete this todolist?</p>
                        <div className="flex gap-2">
                            <button onClick={() => setIsDeleteDialogOpen(false)} className="p-2 bg-mint-500 hover:bg-mint-700 rounded cursor-pointer">cancel</button>
                            <button onClick={() => handleDelete(selectedTaskListId)}className="p-2 bg-red-500 hover:bg-red-700 rounded cursor-pointer">delete</button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </section>
    )
}