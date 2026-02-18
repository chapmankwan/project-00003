
import { Schema, Types } from "mongoose";

const DailySchema = new Schema({
  userId: Types.ObjectId,

  date: {
    type: String,
    required: true
  }

}, {
  timestamps: true
})

DailySchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

export default DailySchema;