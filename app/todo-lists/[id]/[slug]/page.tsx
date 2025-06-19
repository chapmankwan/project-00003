"use client"
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { TodoList } from "@/app/components";

export default function TodoLists () { // temp
  const params = useParams<{id: string, slug: string}>();
  const { status } = useSession();

  if ( status === "unauthenticated" ) redirect("/");
	return <TodoList id={params.id} />;
};