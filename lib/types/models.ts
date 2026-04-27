import { Types } from "mongoose";

export interface TaskDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  listId: Types.ObjectId | { _id: Types.ObjectId; name: string };
  text: string;
  completed: boolean;
  edited: boolean;
  dueDate?: Date | null;
  dateCompleted?: Date;
  order: number;
  type: "normal" | "daily-instance";
  templateId?: Types.ObjectId | null;
  priority: "minor" | "moderate" | "major";
  description?: string;
  subTasks: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyTaskDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  dailyId: Types.ObjectId;
  templateId: Types.ObjectId;
  text: string;
  date: Date;
  completed: boolean;
  order: number;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  tasks: DailyTaskDoc[];
  completedCount: number;
  totalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDoc {
  _id: Types.ObjectId;
  email: string;
  hashedPassword?: string;
  username?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}