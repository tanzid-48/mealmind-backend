import { Request, Response } from "express";
import { Review } from "../models/Review";
import { Recipe } from "../models/Recipe";

// GET /api/reviews/:recipeId  — public
export const getReviewsForRecipe = async (req: Request, res: Response) => {
  const reviews = await Review.find({ recipeId: req.params.recipeId }).sort({
    createdAt: -1,
  });
  res.json(reviews);
};

// POST /api/reviews  [protected]
export const createReview = async (req: Request, res: Response) => {
  const { recipeId, rating, comment } = req.body as {
    recipeId: string;
    rating: number;
    comment: string;
  };

  if (!recipeId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "A recipeId and rating (1-5) are required." });
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found." });
  }

  const review = await Review.create({
    recipeId,
    userId: req.userId,
    userName: req.userEmail?.split("@")[0] || "Anonymous",
    rating,
    comment: comment || "",
  });

  // Recalculate the recipe's average rating
  const allReviews = await Review.find({ recipeId });
  const avg =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  recipe.ratingAvg = Math.round(avg * 10) / 10;
  recipe.ratingCount = allReviews.length;
  await recipe.save();

  res.status(201).json(review);
};
