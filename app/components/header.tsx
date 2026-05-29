"use client"
import Image from "next/image";
import Link from "next/link"

import { useSession } from "next-auth/react";

import { Menu } from "@/app/components";
import { AccountDropdown } from "@/app/components";

export const Header = () => {
    const { status } = useSession();

    return (
        <header className="sticky top-0 z-30 px-6 py-4 w-full flex items-center justify-between bg-mono-700">
            <Link href={ status === "authenticated" ? "/dashboard" : "/" } className="font-semibold">
                <Image 
                    src="/android-chrome-512x512.png"
                    alt="main"
                    width={30}
                    height={30}
                />
            </Link>

            <Menu/>

            <section className="hidden sm:flex gap-10 *:cursor-pointer text-xs items-center">
                {status === "unauthenticated" ? (
                    <>
                        <Link className="hover:underline hover:underline-offset-4" href="/account/login">Login</Link>
                        <Link className="hover:underline hover:underline-offset-4" href="/account/signup">Sign Up</Link>
                    </>
                ) : (
                    <>
                        <Link className="hover:underline hover:underline-offset-4" href="/dashboard">Dashboard</Link>
                        <Link className="hover:underline hover:underline-offset-4" href="/collections">Collections</Link>
                        <Link className="hover:underline hover:underline-offset-4" href="/dailies">Dailies</Link>
                        <AccountDropdown />
                    </>
                )}
            </section>
        </header>
    );
}