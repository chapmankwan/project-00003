"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link"

import { todaysDate } from "@/app/constants";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

export const Menu = ({

}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);


    const keyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Escape") {
            setIsMenuOpen(false);
        }
    };

    // Hook for focus trap
    useEffect(() => {
        if (!isMenuOpen || !menuRef.current) return;
    
        const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
    
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];
    
        const handleKeyDown = (e: KeyboardEvent) => {
            if ( e.key === "Esc" ) { setIsMenuOpen(false); }
            else if ( e.key !== "Tab" ) return;
    
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };
    
        document.addEventListener("keydown", handleKeyDown);
        firstEl?.focus(); // Automatically focus first item
    
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMenuOpen]);
    
    
    return (
        <>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer">
                <Bars3Icon className="size-6 sm:hidden" />
            </button>

            <div
                className={clsx(
                    "fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMenuOpen(false)}
            />

            <div
                className={clsx(
                    "fixed inset-0 z-50 h-full bg-slate-700 transition-transform duration-300 transform flex flex-col items-center justify-center gap-8 text-lg",
                    isMenuOpen ? "translate-x-0" : "translate-x-full",
                )}
            >
                <button 
                    className="absolute top-0 right-0 p-2 m-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    onKeyDown={keyPress}
                >
                    <XMarkIcon className="size-6" />
                </button>

                <Link onClick={() => setIsMenuOpen(false)} className="m-2 p-2 hover:text-slate-400 hover:underline hover:underline-offset-2" href={`/todo-lists/${todaysDate}`}>Tasks</Link>
                <Link onClick={() => setIsMenuOpen(false)} className="m-2 p-2 hover:text-slate-400 hover:underline hover:underline-offset-2" href="/workspaces">Workspaces</Link>
                {
                    !user ? 
                    <button className="p-3 hover:text-slate-400 hover:underline hover:underline-offset-2" onClick={() => setUser(true)}>
                        Login
                    </button> :
                    // <Link className="hover:text-slate-400 hover:underline hover:underline-offset-2" href="/account/login">Login</Link> :
                    <Link onClick={() => setIsMenuOpen(false)} className="m-2 p-2 hover:text-slate-400 hover:underline hover:underline-offset-2" href="/account">Account</Link>
                }
            </div>

        </>
    )
}