"use client"
import Image from "next/image";
import Link from "next/link"
import { redirect } from "next/navigation";

import { signOut, useSession } from "next-auth/react";

import { ClientHeaderLink, Menu } from "@/app/components";

export const Header = () => {
    const { status } = useSession();

    const handleSignOut = () => {
        signOut();
        redirect("/account/signout");
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
                        <ClientHeaderLink />
                        <Link href="/workspaces">Workspaces</Link>
                        <Link href="/account">Account</Link>
                        <button onClick={handleSignOut}>Sign out</button>
                    </>
                }
            </section>
        </header>
    );
}
    