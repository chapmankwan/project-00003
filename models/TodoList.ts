import mongoose from "mongoose";

const SubTaskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
    }
}, { _id: true });

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
    subTasks: [SubTaskSchema]
}); 

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
  },
  title: { 
    type: String, 
    required: true },
  slug: { 
    type: String },
  tasks: [TaskSchema],
  priority: { 
    type: String,
    enum: ["minor", "moderate", "major"],
    default: "moderate",
   },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TodoList || mongoose.model("TodoList", TodoListSchema);