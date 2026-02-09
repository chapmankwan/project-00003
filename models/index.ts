import mongoose from "mongoose";

import CollectionSchema from "./Collection";
import TodoListSchema from "./TodoList";
import TaskSchema from "./Task";
import SubTaskSchema from "./SubTask";

export const Collection =
  mongoose.models.Collection ||
  mongoose.model("Collection", CollectionSchema);

export const TodoList =
  mongoose.models.TodoList ||
  mongoose.model("TodoList", TodoListSchema);

export const Task =
  mongoose.models.Task ||
  mongoose.model("Task", TaskSchema);

export const SubTask =
  mongoose.models.SubTask ||
  mongoose.model("SubTask", SubTaskSchema);