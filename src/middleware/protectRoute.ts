import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    req.userId = session.user.id;
    req.userEmail = session.user.email;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session." });
  }
};
