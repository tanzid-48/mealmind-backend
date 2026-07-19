import rateLimit from "express-rate-limit";

// Protects the public, unauthenticated landing-page AI demo from being used
// to burn through the Gemini quota. 5 requests per hour per IP is plenty for
// someone trying the feature out, and cheap enough to not worry about abuse.
export const demoRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "You've hit the demo limit for this hour. Sign up for unlimited AI recipes.",
  },
});
