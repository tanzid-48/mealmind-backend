import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, streamText, CoreMessage } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = google("gemini-3.5-flash");

// Used by AI Recipe Generator (Content Generator feature)
export const generateRecipeFromIngredients = async (
  ingredients: string[],
  dietType: string,
  servings: number,
  detailLevel: "short" | "detailed" = "detailed"
) => {
  const lengthInstruction =
    detailLevel === "short"
      ? "Keep it to 3-4 short, punchy steps."
      : "Write 5-8 clear, detailed steps.";

  const prompt = `You are a professional chef. Create ONE original recipe using mainly
these ingredients: ${ingredients.join(", ")}.
Diet preference: ${dietType}.
Servings: ${servings}.
${lengthInstruction}

Respond ONLY with valid JSON in this exact shape, no markdown fences, no extra text:
{
  "title": "string",
  "shortDesc": "string, max 200 chars",
  "steps": ["step 1", "step 2", "..."],
  "cookTime": number (minutes),
  "difficulty": "Easy" | "Medium" | "Hard",
  "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number }
}`;

  const { text } = await generateText({ model, prompt });

  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

// Used by AI Auto-Tagging feature
export const generateTagsForRecipe = async (
  title: string,
  ingredients: string[]
) => {
  const prompt = `Suggest 3-5 short, lowercase tags (single words or two-word phrases,
like "quick", "budget-friendly", "spicy", "one-pot", "kid-friendly") for this recipe:
Title: ${title}
Ingredients: ${ingredients.join(", ")}

Respond ONLY with a valid JSON array of strings, nothing else. Example: ["quick","spicy","one-pot"]`;

  const { text } = await generateText({ model, prompt });
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as string[];
};

// Used by AI Chef Assistant (Chat Assistant feature) — streaming
export const streamChefChat = async (messages: CoreMessage[]) => {
  const systemPrompt = `You are MealMind's AI Chef Assistant. You help users with cooking
questions, ingredient substitutions, nutrition advice, and navigating recipes on this app.
Keep answers practical and concise. Stay strictly within cooking, food, and nutrition topics.`;

  return streamText({
    model,
    system: systemPrompt,
    messages,
  });
};
