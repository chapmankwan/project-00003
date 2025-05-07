import Link from "next/link"

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";

export const Header = () => {
    const user = false;
    const todaysDate = new Date().toISOString().split('T')[0];

    return (
        <header className="sticky top-0 z-10 px-6 py-4 w-full flex items-center justify-between bg-slate-700">
            <Link href="/" className="font-semibold">
                Monorail
            </Link>

            <Menu>
                <MenuButton className="inline-flex">
                    <Bars3Icon className="size-6 sm:hidden" />
                </MenuButton>

                <MenuItems
                    transition
                    anchor="bottom end"
                    className="
                        flex flex-col items-end 
                        bg-slate-500
                        rounded-md 
                        z-20 p-3 gap-3 
                        *:hover:bg-slate-600
                        *:p-1 *:w-full *:text-center *:rounded
                    "
                >
                    <MenuItem>
                        <Link href={`/todo-lists/${todaysDate}`}>Tasks</Link>
                    </MenuItem>
                    <MenuItem>
                        <Link href="/workspaces">Workspaces</Link>
                    </MenuItem>
                    <MenuItem>
                    {
                        !user ? 
                        <Link href="/account/login">Login</Link> :
                        <Link href="/account">Account</Link>
                    }
                    </MenuItem>
                </MenuItems>
            </Menu>

            <section className="hidden sm:flex gap-10 *:cursor-pointer *:hover:underline *:hover:underline-offset-4 text-xs">
                <Link href={`/todo-lists/${todaysDate}`}>Tasks</Link>
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
    