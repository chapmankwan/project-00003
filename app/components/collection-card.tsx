"use client"
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronUpDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// *** FIX TYPING
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CollectionCard = ({ collection, index, onClickDeleteCollectionButton }: { collection: any, index: number, onClickDeleteCollectionButton: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void }) => {
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