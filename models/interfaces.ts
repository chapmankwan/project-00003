export * from "./User";
export * from "./TodoList";

import { Types } from "mongoose";

export interface SubTask {
  completed: boolean;
  order: number;
  text: string;
}
export interface Task {
  completed: boolean;
  date: Date;
  dateCompleted: string | boolean;
  edited: boolean;
  _id: Types.ObjectId;
  text: string;
  priority: "minor" | "moderate" | "major";
  order: number;
  description?: string;
  subTasks?: SubTask[];
  type: "normal" | "daily-instance";
  templateId?: Types.ObjectId; // if generated from template
  recurrence?: string;
}

export interface SubTask {
  completed: boolean;
  _id: Types.ObjectId;
  text: string;
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
  todoLists?: TodoListModel[];
  order: number;
}

export interface DailyTaskTemplate {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  isActive: boolean; // use this to toggle daily without deletion
  createdAt: Date;
  updatedAt: Date;
}