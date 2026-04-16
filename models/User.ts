// models/User.ts
import { Schema } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  displayName: { type: String, trim: true },
}, { timestamps: true });

export default UserSchema;
