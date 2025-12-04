"use client"
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { FlyoutPanel, PageHeader, Loader } from "@/app/components";
import { useCollectionsApi } from "@/app/utilities/collectionApiHooks";

import { TrashIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

export default function Collections () {
    const { collections, setCollections, loading, fetchCollections, createCollection } = useCollectionsApi();
    const { status } = useSession();

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

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

    const onDeleteHandler = async ( collectionId: string, event: React.MouseEvent<HTMLButtonElement> ) => {
        if (!collectionId.length) return;
        event.stopPropagation();
        event.preventDefault();
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
    };

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            <PageHeader title="Collections"/>
            {
                loading ? 
                <Loader /> :
                <ul className="
                    w-[90%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col gap-1.5
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-mono-300
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-mint-600
                ">
                    {
                        collections.map( (collection, index) => (
                            <Link 
                                key={index} 
                                href={`/collections/${collection._id}/${collection.name}`}
                                className="
                                    bg-mono-700 hover:bg-mono-600
                                    flex items-center first:mt-0 last:mb-0 p-3 rounded-sm gap-3 cursor-pointer"
                            >
                                <span className="flex-1">{collection.name}</span>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col text-xs items-end">
                                        <p className="text-mono-400">
                                            { 
                                                collection?.todoLists?.length && collection.todoLists.length > 0 ? 
                                                `${collection.todoLists.length} trains` :
                                                "empty"
                                            }   
                                        </p>
                                        {/* <div className={clsx(
                                            collection.priority === "minor" && "text-mint-400",
                                            collection.priority === "major" && "text-red-700",
                                        )}>{collection.priority}</div> */}
                                    </div>

                                    <button 
                                        className="flex items-center justify-between cursor-pointer hover:text-red-500" 
                                        onClick={(e) => onDeleteHandler(collection._id, e)}
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

            <button
                ref={createNewRef}
                onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                className="
                    sm:hidden
                    flex items-center justify-center 
                    absolute bottom-4 right-4 p-2 m-2 
                    cursor-pointer rounded-md
                    bg-mint-500 hover:bg-mint-600
                    data-focus:outline data-focus:outline-white data-hover:bg-black/30
                "
            >
                new collection
            </button>
        </section>
    )
}