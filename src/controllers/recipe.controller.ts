import { Request, Response } from "express";
import { Recipe } from "../models/Recipe";

// GET /api/recipes  — list with search, filter, sort, pagination
export const getRecipes = async (req: Request, res: Response) => {
  const {
    search = "",
    cuisine = "",
    diet = "",
    sort = "newest",
    page = "1",
    limit = "8",
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};
  if (search) query.$text = { $search: search };
  if (cuisine) query.cuisineType = cuisine;
  if (diet) query.dietType = diet;

  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    rating: { ratingAvg: -1 },
    quickest: { cookTime: 1 },
  };

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [recipes, total] = await Promise.all([
    Recipe.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Recipe.countDocuments(query),
  ]);

  res.json({
    recipes,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// GET /api/recipes/:id
export const getRecipeById = async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found." });
  }
  res.json(recipe);
};

// POST /api/recipes  [protected]
export const createRecipe = async (req: Request, res: Response) => {
  const recipe = await Recipe.create({
    ...req.body,
    authorId: req.userId,
  });
  res.status(201).json(recipe);
};

// GET /api/recipes/mine  [protected]
export const getMyRecipes = async (req: Request, res: Response) => {
  const recipes = await Recipe.find({ authorId: req.userId }).sort({
    createdAt: -1,
  });
  res.json(recipes);
};

// GET /api/recipes/:id/related
export const getRelatedRecipes = async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found." });
  }

  const related = await Recipe.find({
    _id: { $ne: recipe._id },
    $or: [{ cuisineType: recipe.cuisineType }, { dietType: recipe.dietType }],
  })
    .sort({ ratingAvg: -1 })
    .limit(4);

  res.json(related);
};

// DELETE /api/recipes/:id  [protected, owner only]
export const deleteRecipe = async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found." });
  }
  if (recipe.authorId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own recipes." });
  }
  await recipe.deleteOne();
  res.json({ message: "Recipe deleted." });
};
