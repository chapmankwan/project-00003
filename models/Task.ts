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
    date: { type: Date },
    dateCompleted: { type: Date },
    order: { 
        type: Number, 
        required: true 
    },
    type: {
        type: String,
        enum: ["normal", "daily-instance"],
        default: "normal",
        index: true,
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DailyTaskTemplate",
        default: null,
        index: true,
    },
    priority: { 
        type: String,
        enum: ["minor", "moderate", "major"],
        default: "moderate",
    },
    description: { type: String },
    subTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
    }],
}); 

export default TaskSchema