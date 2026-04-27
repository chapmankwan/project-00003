"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export const AccountDropdown = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const username = session?.user?.name ?? session?.user?.email ?? "Account";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 cursor-pointer text-xs"
      >
        {/* Avatar placeholder */}
        <span className="w-6 h-6 rounded-full bg-mono-500 hover:bg-lavender-400 flex items-center justify-center text-mono-100 text-[10px] font-medium select-none">
          {username.charAt(0).toUpperCase()}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-48 rounded-lg bg-mono-700 border border-mono-600 shadow-lg overflow-hidden z-50">
          {/* Username display */}
          <div className="px-4 py-3 border-b border-mono-600">
            <p className="text-xs text-mono-300 truncate">{username}</p>
          </div>

          {/* Items */}
          <div className="flex flex-col py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-xs text-mono-100 hover:bg-mono-600 transition-colors"
            >
              Account settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/account/login" })}
              className="px-4 py-2 text-xs text-mono-100 hover:bg-mono-600 transition-colors text-left cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};