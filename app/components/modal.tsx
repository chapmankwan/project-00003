"use client";
import { useState } from "react"

import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface ModalModel{
    rightButtonText: string;
    callback: () => void;
    leftButtonText: string;
    mainButtonText: string;
    modalDescription: string;
    modalExtraDetails: string;
    modalTitle: string;
}

export const Modal = ({
    rightButtonText,
    callback,
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
                className="m-3 py-1 px-2 rounded cursor-pointer bg-slate-400 hover:bg-slate-500"
                onClick={() => setIsOpen(true)}
            >
                {mainButtonText}
            </button>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
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