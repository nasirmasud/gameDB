import { Schema, models, model, Types } from "mongoose";

export interface IReview {
  _id: string;
  gameId: number; // RAWG game id (external)
  gameName: string; // snapshot, avoids re-fetching RAWG just to show title
  gameImage?: string;
  user: Types.ObjectId; // ref User
  userName: string; // snapshot for fast display without populate
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    gameId: { type: Number, required: true, index: true },
    gameName: { type: String, required: true },
    gameImage: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// A user can only review a given game once
ReviewSchema.index({ gameId: 1, user: 1 }, { unique: true });

const Review = models.Review || model<IReview>("Review", ReviewSchema);

export default Review;
