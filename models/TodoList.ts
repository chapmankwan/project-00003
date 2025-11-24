import mongoose from "mongoose";


const TaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  date: { type: String },
  dateCompleted: { type: String },
  order: { type: Number, required: true },
  priority: { 
    type: String,
    enum: ["minor", "moderate", "major"],
    default: "moderate",
   }
}); 

const TodoListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  slug: { type: String },
  tasks: [TaskSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TodoList || mongoose.model("TodoList", TodoListSchema);