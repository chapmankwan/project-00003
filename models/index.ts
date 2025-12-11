export * from "./User";
export * from "./TodoList";

import { Types } from "mongoose";


export interface Task {
    completed: boolean;
    date: string;
    dateCompleted: string | boolean;
    edited: boolean;
    _id: Types.ObjectId;
    text: string;
    priority: "minor" | "moderate" | "major";
    order: number;
    description?: string;
}

export interface TodoListModel {
  _id: string;
  title: string;
  slug: string;
  dateCreated: Date;
  dateUpdated: Date;
  tasks: Task[];
  priority: string,
  collectionId: string;
}

export interface Collection {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  dateCreated: Date;
  todoLists?: TodoListModel[]
}