import Image from "next/image";
import Link from "next/link"

import { ClientHeaderLink, Menu } from "@/app/components";

export const Header = () => {
    const user = false;

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
                <ClientHeaderLink />
                <Link href="/workspaces">Workspaces</Link>
                {
                    !user ? 
                    <Link href="/account/login">Login</Link> :
                    <Link href="/account">Account</Link>
                }
            </section>
        </header>
    );
}
    