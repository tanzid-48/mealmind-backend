import { Schema, model, Document } from "mongoose";

export interface IFavorite extends Document {
  userId: string;
  recipeId: string;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: String, required: true, index: true },
    recipeId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Favorite = model<IFavorite>("Favorite", favoriteSchema);
