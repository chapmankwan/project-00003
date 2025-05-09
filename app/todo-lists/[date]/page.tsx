import { TodoList } from "@/app/components";

export default function TodoLists({ params }: { params: { date: string } }) {
  const { date } = params;

  return <TodoList date={date} />;
}