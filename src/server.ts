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

// Render (and most PaaS hosts) sit behind a reverse proxy that terminates TLS.
// Without this, Express thinks every request is plain HTTP, so Secure cookies
// (needed for the cross-domain OAuth state cookie) never get set correctly.
app.set("trust proxy", 1);

// Vercel gives every deployment its own unique preview URL
// (mealmind-frontend-<hash>-<team>.vercel.app), not just the stable production
// domain. A static origin string would block those, so check dynamically:
// allow the configured CLIENT_URL exactly, plus any *.vercel.app subdomain.
const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true; // same-origin / non-browser requests (e.g. curl, health checks)
  if (origin === process.env.CLIENT_URL) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
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
