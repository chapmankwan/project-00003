// This breaks
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
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
}); 

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);