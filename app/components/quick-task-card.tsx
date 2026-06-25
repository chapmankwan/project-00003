import Link from "next/link";

export const QuickTaskCard = () => {
    return (
        <Link
            href={`/collections/quick-tasks`}
            className="
                block
                bg-gradient-to-r from-mint-600 to-mint-800 hover:from-mint-600 hover:to-mint-800 
                h-16 p-3 mx-0.5 rounded-2xl cursor-pointer transition"
        >
            <div className="flex items-center justify-between h-full mx-5">
                <span className="font-semibold">Quick Tasks</span>
            </div>
        </Link>
    );
};