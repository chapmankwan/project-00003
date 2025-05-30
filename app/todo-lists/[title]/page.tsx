"use client";
import { useParams } from 'next/navigation'

import { TodoList } from "@/app/components";

const TodoLists = () => {
	const params = useParams<{ title: string; }>()
	return <TodoList title={params.title} />;
};

export default TodoLists;