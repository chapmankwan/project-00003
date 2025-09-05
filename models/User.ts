// models/User.ts
import { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  id: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
}, { timestamps: true });

export const User = models.User || model("User", UserSchema);
