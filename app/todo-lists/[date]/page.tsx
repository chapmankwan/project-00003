"use client";
import { useParams } from 'next/navigation'

import { TodoList } from "@/app/components";

const TodoLists = () => {
	const params = useParams<{ date: string; }>()
	return <TodoList date={params.date} />;
};

export default TodoLists;