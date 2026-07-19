import { Router } from "express";
import {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../controllers/favorite.controller";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();

router.get("/", protectRoute, getMyFavorites);
router.get("/ids", protectRoute, getMyFavoriteIds);
router.post("/:recipeId", protectRoute, addFavorite);
router.delete("/:recipeId", protectRoute, removeFavorite);

export default router;
