"use client"
import { useEffect, useState } from "react";

import { Task } from "@/app/models";

import clsx from "clsx";

interface DetailPanelModel {
    task: Task;
    onClose: () => void;
};

export const DetailPanel =({
    task,
    onClose,
}: DetailPanelModel) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in after mount
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        // Animate out first, then unmount
        setIsVisible(false);
        setTimeout(onClose, 300); // match transition duration
    };

    return (
        <section className="fixed inset-0 z-40">
        {/* Backdrop */}
            <div
                className={clsx(
                "absolute inset-0 bg-black/50 transition-opacity duration-500 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Flyout Panel */}
            <div
                className={clsx(
                "absolute bottom-0 left-0 right-0 z-50 bg-slate-800 text-mint-300 shadow-2xl rounded-t-2xl",
                "transform transition-transform duration-500 ease-out h-[75vh] overflow-y-auto",
                isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="p-4 flex justify-between items-center border-b border-mint-500/20">
                    <h2 className="text-lg font-semibold">Task Details</h2>
                    <button onClick={handleClose} className="text-mint-400 hover:text-mint-200">
                        close
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    <p><strong>Due:</strong> {task.date}</p>
                    <p><strong>Completed:</strong> {task.dateCompleted ?? "Not yet complete"}</p>
                </div>
            </div>
        </section>
    );
}
