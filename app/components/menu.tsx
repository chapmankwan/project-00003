"use client";
import React, { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link"

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";
import { redirect } from "next/navigation";

const menuTailwindCss = "m-2 p-2 rounded-4xl hover:text-mono-400 hover:underline hover:underline-offset-2";

export const Menu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { status } = useSession(); 

    const menuRef = useRef<HTMLDivElement | null>(null);

    const keyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Escape") {
            setIsMenuOpen(false);
        }
    };

    const handleSignOut = () => {
        signOut();
        setIsMenuOpen(false);
        redirect("/account/signout");
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
                    "fixed inset-0 z-40 bg-mono-900/60 backdrop-blur-sm transition-opacity duration-300",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMenuOpen(false)}
            />

            <div
                className={clsx(
                    "fixed inset-0 z-50 h-full bg-mono-700 transition-transform duration-300 transform flex flex-col items-center justify-center gap-8 text-lg",
                    isMenuOpen ? "translate-x-0" : "translate-x-full",
                )}
            >
                <button 
                    id="closeButton"
                    className="absolute top-0 right-0 p-2 m-2 cursor-pointer hover:bg-gray-400 rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                    onKeyDown={keyPress}
                >
                    <XMarkIcon className="size-6" />
                </button>

                {/* Hidden menu for authenticated users */}
                {status === "authenticated" ? (
                    <>
                        <Link onClick={() => setIsMenuOpen(false)} className={menuTailwindCss} href="/workspaces">Workspaces</Link>
                        <Link
                            onClick={() => setIsMenuOpen(false)}
                            className={menuTailwindCss}
                            href="/account"
                        >
                            Account
                        </Link>
                        <button 
                            className={menuTailwindCss}
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    </>
                    ) : (
                        <>
                        <Link
                            onClick={() => setIsMenuOpen(false)}
                            className={menuTailwindCss}
                            href="/account/login"
                        >
                            Login
                        </Link>
                        <Link onClick={() => setIsMenuOpen(false)} className={menuTailwindCss} href="/account/signup">Sign up</Link>
                    </>
                )}
            </div>

        </>
    )
}