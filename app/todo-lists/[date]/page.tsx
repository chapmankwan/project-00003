import { TodoList } from "@/app/components";

export default async function TodoLists({ params }: { params: { date: string } }) {
    const { date } = await params

    return await <TodoList date={date} />;
  }