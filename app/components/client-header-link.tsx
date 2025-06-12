"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { findOrCreateTodayList } from "@/app/utilities";

interface ClientHeaderLinkModel {
  className?: string;
  onClick?: () => void;
}

export const ClientHeaderLink = ({
  className,
  onClick
}: ClientHeaderLinkModel) => {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // <-- ensures client-only
    const { id, slug } = findOrCreateTodayList();
    setHref(`/todo-lists/${id}/${slug}`);
  }, []);

  if (!href) return null; // or a loading fallback like <span>Loading...</span>

  return <Link onClick={onClick} className={className} href={href}>Tasks</Link>;
};