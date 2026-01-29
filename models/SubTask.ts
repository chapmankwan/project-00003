import mongoose, { Schema, Types } from "mongoose";

const SubTaskSchema = new Schema(
	{
		userId: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		taskId: {
			type: Types.ObjectId,
			ref: "Task",
			required: true,
			index: true,
		},

		listId: {
			type: Types.ObjectId,
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
			default: false,
		},

		order: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.SubTask ||
  mongoose.model("SubTask", SubTaskSchema);
