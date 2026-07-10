import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed, never sent to client
  role: "user" | "admin";
  isBanned: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // select:false → never returned by default
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    image: { type: String },
  },
  { timestamps: true }
);

// Prevent model overwrite error on Next.js hot reload
const User = models.User || model<IUser>("User", UserSchema);

export default User;
