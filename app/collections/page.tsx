"use client"
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { PageHeader, Loader } from "@/app/components";
import { useCollectionsApi } from "@/app/utilities/collectionApiHooks";
import Form from "next/form";
import Link from "next/link";

export default function Collections () {
    const { collections, loading, fetchCollections, createCollection } = useCollectionsApi();
    const { status } = useSession();

    // const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

    const createNewRef = useRef<HTMLButtonElement>(null)

    const [newCollectionInput, setNewCollectionInput] = useState<string>("");
    
    if ( status === "unauthenticated" ) redirect("/");

    useEffect( () => {
        // Only fetch for initial mount
        fetchCollections();
    },[fetchCollections]);
    
    useEffect(() => {
        // only focus on the create new button if there are no tasklists
        if( createNewRef.current && !(collections.length > 0)) createNewRef.current.focus();
    }, [collections])

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            <PageHeader title="Collections"/>
            <Form action="/collections" onSubmit={() => createCollection({
                name: newCollectionInput
            })}>
                <input 
                    className="border border-solid border-mint-500 p-2 rounded"
                    placeholder="new collection input" 
                    value={newCollectionInput} 
                    onChange={(e) => setNewCollectionInput(e.target.value)}/>
            </Form>
            <button
                ref={createNewRef}
                className="
                    sm:hidden
                    flex items-center justify-center 
                    absolute bottom-4 right-4 p-2 m-2 
                    cursor-pointer rounded-md
                    bg-mint-500 hover:bg-mint-600
                    data-focus:outline data-focus:outline-white data-hover:bg-black/30
                "
            >
                CREATE NEW COLLECTION
                {/* <PlusIcon className="size-6"/> */}
            </button>
            {
                loading ? 
                <Loader /> :
                <ul className="space-y-2 w-[90%] lg:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto">
                    {
                        collections.map( (collection, index) => (
                            <Link key={index} href={`/collections/${collection._id}/${collection.name}`}>
                                {collection.name}
                            </Link>
                        ))
                    }
                </ul>
            }

            {/* {
                isFlyoutOpen && 
                <FlyoutPanel 
                    // use this to refetch after creating a new list
                    callback={fetchLists}
                    onClose={() => setIsFlyoutOpen(false)}
                    onSubmit={ ({ text, priority }) => handleCreateTodolist( text, priority )}
                    panelTitle="New Workspace"
                    type="todolist"
                />
            } */}
        </section>
    )
}