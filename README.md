# MealMind AI — Backend (Phase 1)

## What's included in this phase
- Express + TypeScript server
- MongoDB connection (Mongoose)
- Better Auth (email/password) wired into Express
- Recipe model + full CRUD routes (list/search/filter/sort/pagination, details, create, delete, "my recipes")
- Review + ChatHistory models (ready for later phases)
- Gemini AI service: recipe generator + streaming chat
- AI routes: generate-recipe, chat (streaming), chat history

## How to run locally

1. Open a terminal in this `server/` folder
2. Install dependencies:
   ```
   npm install
   ```
3. Your `.env` is already filled in with the values you gave. Double check `MONGODB_URI`,
   `GEMINI_API_KEY`, and `BETTER_AUTH_SECRET` are correct before running.
4. Start the dev server:
   ```
   npm run dev
   ```
5. You should see:
   ```
   MongoDB connected successfully
   MealMind server running on http://localhost:5000
   ```
6. Test it's alive: open `http://localhost:5000/api/health` in your browser — should return
   `{"status":"ok","message":"MealMind API is running"}`

## If MongoDB connection fails
- Go to MongoDB Atlas → Network Access → Add IP Address → "Allow access from anywhere" (0.0.0.0/0)
  for local dev (tighten this before production).
- Double check the password in `MONGODB_URI` doesn't contain special characters that need
  URL-encoding (e.g. `@`, `#`, `%`).

## Next phase
Once this runs cleanly on your machine, tell Claude and Phase 2 (Next.js frontend — landing page,
theme system, navbar/footer) starts.
