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

	// useEffect(() => {
	// 	const loadList = async () => {
			
	// 		try {
	// 			const postResponse = await fetch("/api/todo-lists", {
	// 				method: "POST",
	// 			});
	// 			if (!postResponse.ok) throw new Error("Failed to create a new list");

	// 			const newList = await postResponse.json();
	// 			setHref(`/todo-lists/${newList.id}/${newList.slug}`);
	// 		} catch (err) {
	// 			console.error("There was an error loading todolists, check logs", err);
	// 		}
	// 	}

	// 	if ( status === "authenticated" ) {
	// 		setTimeout( () => {
	// 			loadList()
	// 		}, 1000)
	// 	}
	// }, [status]);

	

	if (!href) return <span className="text-gray-500 cursor-not-allowed">Loading...</span>;

	if (status === "authenticated") {
		return (
			<Link onClick={onClick} className={className} href={href}>Create New</Link>
		);
	}
};