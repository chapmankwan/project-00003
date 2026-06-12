"use client"
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { FlyoutPanel, PageHeader, Loader, MoveableFab } from "@/app/components";
import { useCollectionsApi } from "@/app/utilities/collectionApiHooks";

import { Dialog, DialogPanel } from '@headlessui/react';
import { ChevronUpDownIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import Link from "next/link";

export default function Collections () {
    const { collections, setCollections, loading, fetchCollections, createCollection } = useCollectionsApi();
    const { status } = useSession();

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState("");

    // Drag n Drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = collections.findIndex(c => c._id.toString() === active.id);
            const newIndex = collections.findIndex(c => c._id.toString() === over?.id);
            const reordered = arrayMove(collections, oldIndex, newIndex);
            console.log("Reordered collections:", reordered);
            setCollections(reordered);

            // sync to server
            fetch(`/api/collections/reorder`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: reordered?.map(c => c._id.toString()) }),
            });
        }
    };

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
        createCollection({name: text, order: collections.length});
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

    // *** FIX TYPING
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CollectionCard = ({ collection, index }: { collection: any, index: number }) => {
        const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: collection._id.toString() });
        const draggingStyle = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };
            return (
                <Link 
                    key={index} 
                    ref={setNodeRef}
                    href={`/collections/${collection._id}/${collection.name}`}
                    className="
                        bg-mono-700 hover:bg-mono-600
                        flex items-center first:mt-0 last:mb-0 p-3 h-16 rounded-2xl gap-1 cursor-pointer mx-0.5"
                    style={draggingStyle}
                    {...attributes}
                >
                    <button
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing touch-none"
                        aria-label="Reorder collection"
                    >
                        <ChevronUpDownIcon className="size-4 text-mono-400" />
                    </button>
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
            )
    };    

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            <PageHeader title="Collections"/>
            {
                loading ? 
                <Loader /> :
                <ul className="w-[85%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col gap-1.5 scrollbar-soft">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={collections.map(c => c._id.toString())} strategy={verticalListSortingStrategy}>
                            {
                                collections.map( (collection, index) => (
                                    <CollectionCard key={collection._id} collection={collection} index={index} />
                                ))
                            }
                        </SortableContext>
                    </DndContext>
                </ul>
            }
            {
                isFlyoutOpen && 
                <FlyoutPanel 
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
                        <p>Do you want to delete this collection?</p>
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