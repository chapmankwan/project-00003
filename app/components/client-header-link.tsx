"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ClientHeaderLinkModel {
	className?: string;
	onClick?: () => void;
}

export const ClientHeaderLink = ({
	className,
	onClick
}: ClientHeaderLinkModel) => {
	const [href, ] = useState<string | null>(null);
	const { status } = useSession();

	if (!href) return <span className="text-gray-500 cursor-not-allowed">Loading...</span>;

	if (status === "authenticated") {
		return (
			<Link onClick={onClick} className={className} href={href}>Create New</Link>
		);
	}
};