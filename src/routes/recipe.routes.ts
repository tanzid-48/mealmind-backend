import { Router } from "express";
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  getMyRecipes,
  deleteRecipe,
  getRelatedRecipes,
} from "../controllers/recipe.controller";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();

router.get("/", getRecipes);
router.get("/mine", protectRoute, getMyRecipes);
router.get("/:id", getRecipeById);
router.get("/:id/related", getRelatedRecipes);
router.post("/", protectRoute, createRecipe);
router.delete("/:id", protectRoute, deleteRecipe);

export default router;
