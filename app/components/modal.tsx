"use client";
import { useState } from "react"

import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from "clsx";

interface ModalModel{
    rightButtonText: string;
    callback: () => void;
    disabled: boolean;
    leftButtonText: string;
    mainButtonText: string;
    modalDescription: string;
    modalExtraDetails: string;
    modalTitle: string;
}

export const Modal = ({
    rightButtonText,
    callback,
    disabled,
    leftButtonText,
    mainButtonText,
    modalDescription,
    modalExtraDetails,
    modalTitle,
}: ModalModel) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDeleteAll = () => {
        callback();
        setIsOpen(false);
    }
    
    return (
        <>
            <button 
                disabled={disabled}
                className={clsx("m-3 py-1 px-2 rounded cursor-pointer bg-slate-600 hover:bg-red-700", disabled && "disabled:cursor-auto disabled:hover:bg-slate-400")}
                onClick={() => setIsOpen(true)}
            >
                {mainButtonText}
            </button>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg space-y-4 border bg-slate-500 p-12 rounded">
                        <DialogTitle className="font-bold">{modalTitle}</DialogTitle>
                        <Description>{modalDescription}</Description>
                        <p>{modalExtraDetails}</p>
                        <div className="flex gap-3">
                            <button className="rounded cursor-pointer px-3 py-2 bg-slate-600" onClick={() => setIsOpen(false)}>{leftButtonText}</button>
                            <button className="rounded cursor-pointer px-3 py-2 bg-red-500" onClick={handleDeleteAll}>{rightButtonText}</button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    )
}