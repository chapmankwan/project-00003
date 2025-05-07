"use client";
import { useState } from "react";
import Link from "next/link"

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

export const Menu = ({

}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(false);

    const todaysDate = new Date().toISOString().split('T')[0];
    
    return (
        <>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer">
                <Bars3Icon className="size-6 sm:hidden" />
            </button>

            <div
            className={clsx(
                "fixed inset-0 z-50 bg-slate-700 transition-transform duration-300 transform flex flex-col items-center justify-center gap-8 text-lg",
                isMenuOpen ? "translate-x-0" : "translate-x-full",
            )}
            >
                <Link className="hover:text-slate-400 hover:underline hover:underline-offset-2" href={`/todo-lists/${todaysDate}`}>Tasks</Link>
                <Link className="hover:text-slate-400 hover:underline hover:underline-offset-2" href="/workspaces">Workspaces</Link>
                {
                    !user ? 
                    <button className="hover:text-slate-400 hover:underline hover:underline-offset-2" onClick={() => setUser(true)}>
                        Login
                    </button> :
                    // <Link className="hover:text-slate-400 hover:underline hover:underline-offset-2" href="/account/login">Login</Link> :
                    <Link className="hover:text-slate-400 hover:underline hover:underline-offset-2" href="/account">Account</Link>
                }

                <button 
                    className="absolute top-0 right-0 p-4 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <XMarkIcon className="size-6" />
                </button>
            </div>

        </>
    )
}