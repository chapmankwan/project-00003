import { TodoList } from "@/app/components"; // must be a Client Component
import { type FC } from "react";

interface PageProps {
  params: { date: string };
}

const TodoLists: FC<PageProps> = ({ params }) => {
  const { date } = params;

  return <TodoList date={date} />;
};

export default TodoLists;