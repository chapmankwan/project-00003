import mongoose from "mongoose";

import CollectionSchema from "./Collection";
import DailySchema from "./daily/Daily";
import DailyTaskSchema from "./daily/DailyTask";
import DailyTaskTemplateSchema from "./daily/DailyTaskTemplate";
import SubTaskSchema from "./SubTask";
import TaskSchema from "./Task";
import TodoListSchema from "./TodoList";

export const Collection =
  mongoose.models.Collection ||
  mongoose.model("Collection", CollectionSchema);

export const Daily = 
  mongoose.models.Daily || 
  mongoose.model("Daily", DailySchema);

  export const DailyTask = 
  mongoose.models.DailyTask || 
  mongoose.model("DailyTask", DailyTaskSchema);

export const DailyTaskTemplate =
  mongoose.models.DailyTaskTemplate ||
  mongoose.model("DailyTaskTemplate", DailyTaskTemplateSchema);

export const TodoList =
  mongoose.models.TodoList ||
  mongoose.model("TodoList", TodoListSchema);

export const Task =
  mongoose.models.Task ||
  mongoose.model("Task", TaskSchema);

export const SubTask =
  mongoose.models.SubTask ||
  mongoose.model("SubTask", SubTaskSchema);