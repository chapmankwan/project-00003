"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const GreetingHeader = () => {
  const greeting = useMemo(() => getGreeting(), []);
  const date = useMemo(() => getFormattedDate(), []);

  const { data: session } = useSession();

  return (
    <div className="flex items-baseline justify-between">
      <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
        {greeting} {session?.user?.username ?? "there"}!
      </h1>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{date}</span>
    </div>
  );
}