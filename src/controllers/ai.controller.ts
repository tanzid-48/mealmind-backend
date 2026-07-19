import { Request, Response } from "express";
import { generateRecipeFromIngredients, streamChefChat, generateTagsForRecipe } from "../services/gemini.service";
import { ChatHistory } from "../models/ChatHistory";
import { CoreMessage } from "ai";

// POST /api/ai/demo-generate  [public, rate-limited]
// A capped preview version of the recipe generator for the landing page —
// max 3 ingredients, short output, only a preview of the steps returned.
export const generateDemoRecipe = async (req: Request, res: Response) => {
  const { ingredients } = req.body as { ingredients: string[] };

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "Please provide at least one ingredient." });
  }

  const cappedIngredients = ingredients.slice(0, 3);

  try {
    const recipe = await generateRecipeFromIngredients(
      cappedIngredients,
      "Any",
      2,
      "short"
    );
    res.json({
      title: recipe.title,
      shortDesc: recipe.shortDesc,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty,
      previewSteps: recipe.steps.slice(0, 2),
      totalSteps: recipe.steps.length,
    });
  } catch (error) {
    console.error("generateDemoRecipe error:", error);
    res.status(500).json({ message: "AI could not generate a recipe. Please try again." });
  }
};

// POST /api/ai/generate-recipe  [protected]
export const generateRecipe = async (req: Request, res: Response) => {
  const { ingredients, dietType, servings, detailLevel } = req.body as {
    ingredients: string[];
    dietType: string;
    servings: number;
    detailLevel?: "short" | "detailed";
  };

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "Please provide at least one ingredient." });
  }

  try {
    const recipe = await generateRecipeFromIngredients(
      ingredients,
      dietType || "Any",
      servings || 2,
      detailLevel || "detailed"
    );
    res.json(recipe);
  } catch (error) {
    console.error("generateRecipe error:", error);
    res.status(500).json({ message: "AI could not generate a recipe. Please try again." });
  }
};

// POST /api/ai/chat  [protected] — streams the response back
export const chatWithChef = async (req: Request, res: Response): Promise<void> => {
  const { messages, sessionId } = req.body as {
    messages: CoreMessage[];
    sessionId: string;
  };

  try {
    const result = await streamChefChat(messages);

    // Save conversation once the stream finishes
    result.text
      .then(async (fullText: string) => {
        const lastUserMessage = messages[messages.length - 1];
        await ChatHistory.findOneAndUpdate(
          { sessionId },
          {
            $push: {
              messages: [
                { role: "user", content: lastUserMessage.content, timestamp: new Date() },
                { role: "assistant", content: fullText, timestamp: new Date() },
              ],
            },
            $setOnInsert: { userId: req.userId, sessionId },
          },
          { upsert: true }
        );
      })
      .catch((err) => {
        // The stream itself failed (e.g. bad API key) — already reported to the client
        // via the data stream's error event. Just log it here, never let it crash the server.
        console.error("chatWithChef stream/save error:", err);
      });

    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error("chatWithChef error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "AI chef could not respond. Please try again." });
    }
  }
};

// GET /api/ai/chat/history/:sessionId  [protected]
export const getChatHistory = async (req: Request, res: Response) => {
  const history = await ChatHistory.findOne({
    sessionId: req.params.sessionId,
    userId: req.userId,
  });
  res.json(history?.messages || []);
};

// POST /api/ai/generate-tags  [protected] — AI Auto-Tagging feature
export const generateTags = async (req: Request, res: Response) => {
  const { title, ingredients } = req.body as { title: string; ingredients: string[] };

  if (!title || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "Title and ingredients are required." });
  }

  try {
    const tags = await generateTagsForRecipe(title, ingredients);
    res.json({ tags });
  } catch (error) {
    console.error("generateTags error:", error);
    res.status(500).json({ message: "Could not generate tags. Please try again." });
  }
};
