import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import dotenv from "dotenv";
dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(req.cookies);
    const token = req.cookies?.parkbuddy_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      roles: decoded.roles,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


