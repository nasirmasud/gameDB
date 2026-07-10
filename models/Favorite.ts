import { Schema, models, model, Types } from "mongoose";

export interface IFavorite {
  _id: string;
  gameId: number; // RAWG game id
  gameName: string;
  gameImage?: string;
  gameRating?: number;
  user: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    gameId: { type: Number, required: true },
    gameName: { type: String, required: true },
    gameImage: { type: String },
    gameRating: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate favorites of the same game by the same user
FavoriteSchema.index({ gameId: 1, user: 1 }, { unique: true });

const Favorite = models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);

export default Favorite;
