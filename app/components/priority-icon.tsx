
import { ChevronDoubleUpIcon, ChevronDownIcon, MinusIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

interface PriorityIcon {
    priority: string
}

const DEFAULT_ICON_SIZE = "size-4"

export const PriorityIcon = ({
    priority
}: PriorityIcon) => {
    let priorityNode: React.ReactNode

    switch (priority) {
        case "major":
            priorityNode = 
                <ChevronDoubleUpIcon className={clsx(
                    DEFAULT_ICON_SIZE,
                    "text-red-400"
                )} />
            break;
        case "minor":
            priorityNode = 
                <ChevronDownIcon className={clsx(
                    DEFAULT_ICON_SIZE,
                    "text-mint-400"
                )} />
            break;
        default:
            priorityNode = 
                <MinusIcon className={clsx(
                    DEFAULT_ICON_SIZE,
                    "text-lavender-400"
                )} />
    }

    return (
        <span className="mr-1">
            { priorityNode }
        </span>
    )

}