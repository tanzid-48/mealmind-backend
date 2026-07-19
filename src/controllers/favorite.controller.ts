import { Request, Response } from "express";
import { Favorite } from "../models/Favorite";
import { Recipe } from "../models/Recipe";

// GET /api/favorites  [protected]  — list the user's favorited recipes (populated)
export const getMyFavorites = async (req: Request, res: Response) => {
  const favorites = await Favorite.find({ userId: req.userId }).sort({ createdAt: -1 });
  const recipeIds = favorites.map((f) => f.recipeId);
  const recipes = await Recipe.find({ _id: { $in: recipeIds } });

  // Preserve favorite order
  const ordered = recipeIds
    .map((id) => recipes.find((r) => r._id.toString() === id))
    .filter(Boolean);

  res.json(ordered);
};

// GET /api/favorites/ids  [protected] — just the recipe ids, for quick "is this favorited" checks
export const getMyFavoriteIds = async (req: Request, res: Response) => {
  const favorites = await Favorite.find({ userId: req.userId }).select("recipeId");
  res.json(favorites.map((f) => f.recipeId));
};

// POST /api/favorites/:recipeId  [protected]
export const addFavorite = async (req: Request, res: Response) => {
  try {
    await Favorite.create({ userId: req.userId, recipeId: req.params.recipeId });
    res.status(201).json({ message: "Added to favorites." });
  } catch (err) {
    // Duplicate (already favorited) — treat as success, it's already in the desired state.
    res.status(200).json({ message: "Already in favorites." });
  }
};

// DELETE /api/favorites/:recipeId  [protected]
export const removeFavorite = async (req: Request, res: Response) => {
  await Favorite.deleteOne({ userId: req.userId, recipeId: req.params.recipeId });
  res.json({ message: "Removed from favorites." });
};
