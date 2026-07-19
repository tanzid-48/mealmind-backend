import { Router } from "express";
import { generateRecipe, chatWithChef, getChatHistory, generateDemoRecipe, generateTags } from "../controllers/ai.controller";
import { protectRoute } from "../middleware/protectRoute";
import { demoRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/demo-generate", demoRateLimiter, generateDemoRecipe);
router.post("/generate-recipe", protectRoute, generateRecipe);
router.post("/generate-tags", protectRoute, generateTags);
router.post("/chat", protectRoute, chatWithChef);
router.get("/chat/history/:sessionId", protectRoute, getChatHistory);

export default router;
