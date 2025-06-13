"use client"
// import { notFound, redirect  } from "next/navigation";
import { useParams } from "next/navigation";
// import { toSlug } from "@/app/utilities";
// import { TodoListModel } from "@/app/models";

import { TodoList } from "@/app/components";

export default function TodoLists () { // temp
  const params = useParams<{id: string, slug: string}>();

  // const allLists = JSON.parse(localStorage.getItem("todoLists") || "[]");
  // const allLists: TodoListModel[] = [];
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const list = allLists.find((l: { id: any; }) => l.id === params.id);

  // if (!list) return notFound();

  // const canonicalSlug = toSlug(list.title);
  // if (params.slug !== canonicalSlug) {
  //   redirect(`/todo-lists/${params.id}/${canonicalSlug}`);
  // }

	return <TodoList id={params.id} />;

};