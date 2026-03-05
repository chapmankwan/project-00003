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
      enum: ["minor", "moderate", "major"],
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

    recurrence: {
      type: String,
      default: "FREQ=DAILY",
        // FREQ=DAILY
        // FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
        // FREQ=MONTHLY;BYMONTHDAY=1
        // FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=4 
    },
  },
  { timestamps: true }
);

export default DailyTaskTemplateSchema;
