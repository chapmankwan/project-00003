import { Schema, Types } from "mongoose";


const DailyTaskSchema = new Schema({

  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  dailyId: {
    type: Schema.Types.ObjectId,
    ref: 'Daily',
    required: true,
    index: true
  },

  templateId: {
    type: Types.ObjectId,
    ref: 'DailyTaskTemplate',
    required: true,
    index: true
  },

  date: {
    type: String,
    required: true,
    index: true
  },

  completed: {
    type: Boolean,
    default: false,
    index: true
  },

  completedAt: Date,

  notes: String

}, {
  timestamps: true
})

DailyTaskSchema.index(
  { userId: 1, date: 1 }
)

DailyTaskSchema.index(
  { userId: 1, templateId: 1, date: 1 },
  { unique: true }
)

export default DailyTaskSchema