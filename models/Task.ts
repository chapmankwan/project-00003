// This breaks
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TodoList",
      required: true,
      index: true,
    },
    text: { 
        type: String, 
        required: true,
        trim: true,
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    edited: { 
        type: Boolean, 
        default: false 
    },
    date: { type: String },
    dateCompleted: { type: String },
    order: { 
        type: Number, 
        required: true 
    },
    priority: { 
        type: String,
        enum: ["minor", "moderate", "major"],
        default: "moderate",
    },
    description: { type: String },
    subTasks: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
        default: [],
    },
}); 

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);