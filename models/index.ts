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
}

export interface TodoListModel {
  _id: string;         // unique ID (UUID or nanoid)
  title: string;      // editable title
  slug: string;       // generated from title
  dateCreated: string;
  tasks: Task[];
}
