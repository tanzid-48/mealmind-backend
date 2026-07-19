import { Router } from "express";
import { getReviewsForRecipe, createReview } from "../controllers/review.controller";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();

router.get("/:recipeId", getReviewsForRecipe);
router.post("/", protectRoute, createReview);

export default router;
