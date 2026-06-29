"use client"
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { CollectionCard, FlyoutPanel, PageHeader, Loader, MoveableFab, QuickTaskCard } from "@/app/components";
import { useCollectionsApi } from "@/app/utilities/collectionApiHooks";

import { Dialog, DialogPanel } from '@headlessui/react';

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
} from "@dnd-kit/sortable";

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
            const oldIndex = visibleCollections.findIndex(c => c._id.toString() === active.id);
            const newIndex = visibleCollections.findIndex(c => c._id.toString() === over?.id);
            if (oldIndex === -1 || newIndex === -1) return;
            // Reorder the full collections array based on visibleCollections move
            const reorderedVisible = arrayMove(visibleCollections, oldIndex, newIndex);
            // Build new full collections array preserving items not in visibleCollections
            const hidden = collections.filter(c => c.name === "Quick Tasks");
            const reordered = [...reorderedVisible, ...hidden];
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

    // derive visible collections excluding Quick Tasks so we can render a standalone card
    const visibleCollections = collections.filter(c => c.name !== "Quick Tasks");

    useEffect( () => {
        // Only fetch for initial mount
        fetchCollections();
    },[fetchCollections]);

    // server will ensure `Quick Tasks` exists on first access; no client-side auto-creation needed
    
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

    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100dvh-72px)]">
            <PageHeader title="Collections"/>
            {
                loading ? 
                <Loader /> :
                <ul className="w-[85%] md:w-2/3 flex-grow overflow-y-auto overflow-x-hidden mb-4 flex flex-col gap-1.5 scrollbar-soft">
                    <QuickTaskCard />
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={visibleCollections.map(c => c._id.toString())} strategy={verticalListSortingStrategy}>
                            {
                                visibleCollections.map( (collection, index) => (
                                    <CollectionCard key={collection._id} collection={collection} index={index} onClickDeleteCollectionButton={onClickDeleteCollectionButton} />
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