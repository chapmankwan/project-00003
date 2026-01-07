"use client"
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { FlyoutPanel, PageHeader, Loader, MoveableFab } from "@/app/components";
import { useCollectionsApi } from "@/app/utilities/collectionApiHooks";

import { Dialog, DialogPanel } from '@headlessui/react';
import { TrashIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

export default function Collections () {
    const { collections, setCollections, loading, fetchCollections, createCollection } = useCollectionsApi();
    const { status } = useSession();

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState("");

    const createNewRef = useRef<HTMLButtonElement>(null)
    
    if ( status === "unauthenticated" ) redirect("/");

    useEffect( () => {
        // Only fetch for initial mount
        fetchCollections();
    },[fetchCollections]);
    
    useEffect(() => {
        // only focus on the create new button if there are no tasklists
        if( createNewRef.current && !(collections.length > 0)) createNewRef.current.focus();
    }, [collections])

    const handleCreateCollection = async (text: string) => {
        createCollection({name: text});
        await fetchCollections();
    };

    const onDeleteHandler = async ( collectionId: string ) => {
        if (!collectionId.length) return;
        try {
            const res = await fetch(`/api/collections/${collectionId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete collection");
            // optimistic update
            setCollections((prev) => prev.filter((collection) => collection._id !== collectionId));
            // allow the server to delete without flashing
        } catch (err) {
            console.error(err);
            alert("Failed to delete collection");
        };
        setIsDeleteDialogOpen(false);
    };
    
    const onClickDeleteCollectionButton = (event: React.MouseEvent<HTMLButtonElement>, selectedCollectionId: string) => {
        event.stopPropagation();
        event.preventDefault();
        setIsDeleteDialogOpen(true);
        setSelectedCollectionId(selectedCollectionId);
    };

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            <PageHeader title="Collections"/>
            {
                loading ? 
                <Loader /> :
                <ul className="w-[90%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col gap-1.5 scrollbar-soft">
                    {
                        collections.map( (collection, index) => (
                            <Link 
                                key={index} 
                                href={`/collections/${collection._id}/${collection.name}`}
                                className="
                                    bg-mono-700 hover:bg-mono-600
                                    flex items-center first:mt-0 last:mb-0 p-3 h-16 rounded-2xl gap-1 cursor-pointer mx-0.5"
                            >
                                <span className="flex-1">{decodeURIComponent(collection.name)}</span>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col text-xs items-end">
                                        <p className="text-mono-400">
                                            { 
                                                collection?.todoLists?.length && collection.todoLists.length > 0 ? 
                                                `${collection.todoLists.length} trains` :
                                                "empty"
                                            }   
                                        </p>
                                    </div>

                                    <button 
                                        className="flex items-center justify-between cursor-pointer hover:text-red-500" 
                                        onClick={(e) => onClickDeleteCollectionButton(e, collection._id)}
                                        title="delete"
                                    >
                                        <TrashIcon className="size-5" />
                                    </button>
                                </div>
                            </Link>
                        ))
                    }
                </ul>
            }
            {
                isFlyoutOpen && 
                <FlyoutPanel 
                    // use this to refetch after creating a new list
                    // callback={fetchCollections}
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={ ({ text }) => handleCreateCollection(text)}
                    panelTitle="New Collection"
                    type="collection"
                />
            }

            <MoveableFab onClick={() => setIsFlyoutOpen(!isFlyoutOpen)} />

            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} className="relative z-50 duration-300 ease-out data-closed:opacity-0" transition>
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm space-y-4 bg-mono-700 p-4 rounded backdrop-blur-2xl items-center">
                        <p>Do you want to delete this todolist?</p>
                        <div className="flex gap-2">
                            <button onClick={() => setIsDeleteDialogOpen(false)} className="p-2 bg-mint-500 hover:bg-mint-700 rounded cursor-pointer">cancel</button>
                            <button onClick={() => onDeleteHandler(selectedCollectionId)}className="p-2 bg-red-500 hover:bg-red-700 rounded cursor-pointer">delete</button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </section>
    )
}