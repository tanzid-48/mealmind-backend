import "dotenv/config";
import express from "express";
import cors from "cors";

// Safety net: log unexpected async errors instead of letting them crash the server.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

import { connectDB } from "./config/db";
import { auth } from "./config/auth";
import { toNodeHandler } from "better-auth/node";
import recipeRoutes from "./routes/recipe.routes";
import aiRoutes from "./routes/ai.routes";
import reviewRoutes from "./routes/review.routes";
import favoriteRoutes from "./routes/favorite.routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Better Auth handles its own routes — must be registered BEFORE express.json()
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MealMind API is running" });
});

app.use("/api/recipes", recipeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use(notFound);
app.use(errorHandler);

const seedDemoUser = async () => {
  try {
    await auth.api.signUpEmail({
      body: {
        name: "Demo User",
        email: "demo@mealmind.ai",
        password: "MealMindDemo123!",
      },
    });
    console.log("Demo account created (demo@mealmind.ai)");
  } catch (err) {
    // Already exists — that's fine, nothing to do.
  }
};

const startServer = async () => {
  await connectDB();
  await seedDemoUser();
  app.listen(PORT, () => {
    console.log(`MealMind server running on http://localhost:${PORT}`);
  });
};

startServer();
