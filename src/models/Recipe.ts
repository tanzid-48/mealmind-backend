import { Schema, model, Document, Types } from "mongoose";

export interface IIngredient {
  name: string;
  qty: string;
}

export interface INutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IRecipe extends Document {
  title: string;
  shortDesc: string;
  steps: string[];
  ingredients: IIngredient[];
  images: string[];
  cuisineType: string;
  dietType: string;
  cookTime: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  nutrition: INutrition;
  authorId: string; // Better Auth user id
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true },
    shortDesc: { type: String, required: true, maxlength: 200 },
    steps: { type: [String], required: true },
    ingredients: [
      {
        name: { type: String, required: true },
        qty: { type: String, required: true },
      },
    ],
    images: { type: [String], default: [] },
    cuisineType: { type: String, required: true, index: true },
    dietType: { type: String, required: true, index: true },
    cookTime: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    servings: { type: Number, required: true, default: 2 },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    authorId: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recipeSchema.index({ title: "text", shortDesc: "text" });

export const Recipe = model<IRecipe>("Recipe", recipeSchema);
