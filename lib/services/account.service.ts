import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { UserDoc } from "@/lib/types/models";
import mongoose from "mongoose";

export interface AccountProfile {
  _id: string;
  email: string;
  username?: string;
  displayName?: string;
}

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateEmailResult =
  | { success: true }
  | { success: false; error: string };

export type UpdatePasswordResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Fetches the current user's profile fields for display.
 */
export async function getAccountProfile(
  userId: string
): Promise<AccountProfile | null> {
  await connectToDatabase();

  const user = await User.findById(userId)
    .select("email username displayName")
    .lean<UserDoc>();

  if (!user) return null;

  return {
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    displayName: user.displayName,
  };
}

/**
 * Updates display name and/or username.
 * Checks for username uniqueness before saving.
 */
type MongoDuplicateKeyError = {
  code: 11000;
  keyPattern?: Record<string, unknown>;
};

export async function updateProfile(
  userId: string,
  data: { displayName?: string; username?: string }
): Promise<UpdateProfileResult> {
  await connectToDatabase();

  const update: Partial<{
    displayName: string;
    username: string;
  }> = {};

  if (data.displayName !== undefined) {
    update.displayName = data.displayName;
  }

  if (data.username !== undefined) {
    update.username = data.username.toLowerCase();
  }

  if (Object.keys(update).length === 0) {
    return { success: true };
  }

  try {
    await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { runValidators: true }
    );

    return { success: true };
  } catch (err: unknown) {
    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
      return { success: false, error: "Invalid profile data." };
    }

    // Mongo duplicate key error (type guard)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: unknown }).code === 11000
    ) {
      const mongoErr = err as MongoDuplicateKeyError;

      if (mongoErr.keyPattern?.username) {
        return { success: false, error: "Username is already taken." };
      }
    }

    throw err;
  }
}

/**
 * Verifies current password then updates email.
 * Returns error if current password is wrong or email is taken.
 */
export async function updateEmail(
  userId: string,
  data: { currentPassword: string; newEmail: string }
): Promise<UpdateEmailResult> {
  await connectToDatabase();

  const user = await User.findById(userId)
    .select("hashedPassword email")
    .lean<UserDoc>();

  if (!user) return { success: false, error: "User not found." };
  if (!user.hashedPassword) return { success: false, error: "No password set on this account." };

  const passwordMatch = await bcrypt.compare(data.currentPassword, user.hashedPassword);
  if (!passwordMatch) return { success: false, error: "Current password is incorrect." };

  const emailTaken = await User.findOne({
    email: data.newEmail,
    _id: { $ne: userId },
  }).lean();

  if (emailTaken) return { success: false, error: "Email is already in use." };

  await User.findByIdAndUpdate(userId, { $set: { email: data.newEmail } });

  return { success: true };
}

/**
 * Verifies current password then updates to new password.
 * Returns error if current password is wrong or new password is too short.
 */
export async function updatePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<UpdatePasswordResult> {
  await connectToDatabase();

  if (data.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  const user = await User.findById(userId)
    .select("hashedPassword")
    .lean<UserDoc>();

  if (!user) return { success: false, error: "User not found." };
  if (!user.hashedPassword) return { success: false, error: "No password set on this account." };

  const passwordMatch = await bcrypt.compare(data.currentPassword, user.hashedPassword);
  if (!passwordMatch) return { success: false, error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(data.newPassword, 12);
  await User.findByIdAndUpdate(userId, { $set: { hashedPassword: hashed } });

  return { success: true };
}