"use client"
import Image from "next/image";
import Link from "next/link"
import { redirect } from "next/navigation";

import { signOut, useSession } from "next-auth/react";

import { Menu, NewListInput } from "@/app/components";
import { useState } from "react";

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';


export const Header = () => {
    const { status } = useSession();

    const handleSignOut = () => {
        signOut();
        redirect("/account/signout");
    };

    const [isOpen, setIsOpen] = useState(false);

    const handleButton = () => {
        setIsOpen(true);
    };

    return (
        <header className="sticky top-0 z-30 px-6 py-4 w-full flex items-center justify-between bg-slate-700">
            <Link href="/" className="font-semibold">
                <Image 
                    src="/monorail-logo-raw.png"
                    alt="main"
                    width={30}
                    height={30}
                />
            </Link>

            <Menu />

            <section className="hidden sm:flex gap-10 *:cursor-pointer *:hover:underline *:hover:underline-offset-4 text-xs">
                {
                    status === "unauthenticated" ? 
                    <>
                        <Link href="/account/login">Login</Link>
                        <Link href="/account/signup">Sign Up</Link>
                    </>
                    :
                    <>
                        <button onClick={handleButton}>
                            Create new
                        </button>
                        <Link href="/workspaces">Workspaces</Link>
                        <Link href="/account">Account</Link>
                        <button onClick={handleSignOut}>Sign out</button>
                    </>
                }
            </section>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm space-y-4 bg-slate-500 p-4 rounded">
                        <DialogTitle className="font-bold text-lg">Input a title</DialogTitle>
                        <NewListInput setIsOpen={setIsOpen} />
                    </DialogPanel>
                </div>
            </Dialog>
        </header>
    );
}
    