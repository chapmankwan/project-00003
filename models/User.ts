// models/User.ts
import { Schema } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9_]+$/, // maintain predictability
  },
  displayName: { type: String, trim: true, maxLength: 60 },
}, { timestamps: true });

export default UserSchema;
