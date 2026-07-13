import { Schema, models, model, Types } from "mongoose";

export type GameStatus = "published" | "draft" | "pending" | "archived";

export interface ICustomGame {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  releaseDate: Date;
  genre: string;
  developer?: string;
  publisher?: string;
  platforms?: string[];
  screenshots?: string[];
  tags?: string[];
  imageUrl?: string;
  submittedBy: Types.ObjectId;
  status: GameStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CustomGameSchema = new Schema<ICustomGame>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 200 },
    fullDescription: { type: String, required: true, trim: true, maxlength: 3000 },
    releaseDate: { type: Date, required: true },
    genre: { type: String, required: true },
    developer: { type: String, trim: true },
    publisher: { type: String, trim: true },
    platforms: [{ type: String }],
    screenshots: [{ type: String }],
    tags: [{ type: String }],
    imageUrl: { type: String },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["published", "draft", "pending", "archived"], default: "draft" },
  },
  { timestamps: true }
);

const CustomGame = models.CustomGame || model<ICustomGame>("CustomGame", CustomGameSchema);

export default CustomGame;
