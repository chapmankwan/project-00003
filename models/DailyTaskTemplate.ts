import { Schema, Types } from "mongoose";

const DailyTaskTemplateSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "moderate",
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // future-proofing recurrence
    recurrence: {
      kind: {
        type: String,
        enum: ["daily"],
        default: "daily",
      },
    },
  },
  { timestamps: true }
);

export default DailyTaskTemplateSchema;
