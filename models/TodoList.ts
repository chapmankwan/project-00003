import mongoose from "mongoose";

const TodoListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    index: true,
    // Only required if the list is not a system list to prevent validation errors for system lists that don't have a collectionId
    required: function (this: { type?: string }) {
      return this.type !== "system";
    },
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  }],
  priority: {
    type: String,
    enum: ["minor", "moderate", "major"],
    default: "moderate",
  },
  type: {
    type: String,
    enum: ["standard", "system"],
    default: "standard",
  },
  systemKey: {
    type: String,
    enum: ["inbox", "today", "scheduled", "flagged"],
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  deletable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TodoListSchema.index(
  { userId: 1, systemKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      systemKey: { $exists: true },
    },
  }
);

export default TodoListSchema;