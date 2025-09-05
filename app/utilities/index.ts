import { nanoid } from "nanoid";

import { Task } from "@/models";

export interface TodoListModel {
  id: string;         // unique ID (UUID or nanoid)
  title: string;      // editable title
  slug: string;       // generated from title
  dateCreated: string;
  tasks: Task[];
}

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function createTodoList(title: string): TodoListModel {
  const id = nanoid();
  const slug = toSlug(title);

  const newList: TodoListModel = {
    id,
    title,
    slug,
    dateCreated: new Date().toISOString(),
    tasks: [],
  };

  const existing = JSON.parse(localStorage.getItem("todoLists") || "[]");
  localStorage.setItem("todoLists", JSON.stringify([...existing, newList]));

  return newList;
}

export const findOrCreateTodayList = (): { id: string; slug: string } => {

  if (typeof window === "undefined") throw new Error("localStorage is not available on server");

  const today = new Date().toISOString().split("T")[0];
  const raw = localStorage.getItem("todoLists") || "[]";
  const allLists: TodoListModel[] = JSON.parse(raw);

  let list = allLists.find((l) => l.title === today);
  if (!list) {
    list = {
      id: crypto.randomUUID(),
      title: today,
      slug: today,
      dateCreated: new Date().toISOString(),
      tasks: [],
    };
    allLists.push(list);
    localStorage.setItem("todoLists", JSON.stringify(allLists));
  }

  return { id: list.id, slug: toSlug(list.title) };
};