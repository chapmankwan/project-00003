
import { Schema, Types } from "mongoose";

const DailySchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  date: {
    type: Date,
    required: true
  },

  tasks: [{
    type: Schema.Types.ObjectId,
    ref: "DailyTask",
  }],

  completedCount: { type: Number, default: 0 },
  totalCount:     { type: Number, default: 0 },
  
}, {
  timestamps: true
})

DailySchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

export default DailySchema;