import mongoose from "mongoose";

const TodoListSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    required: true,
    index: true,
  },
  title: { 
    type: String, 
    required: true },
  slug: { 
    type: String },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  }],
  priority: { 
    type: String,
    enum: ["minor", "moderate", "major"],
    default: "moderate",
   },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TodoList || mongoose.model("TodoList", TodoListSchema);