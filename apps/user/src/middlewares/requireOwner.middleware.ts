import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const requireOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.roles.includes("OWNER")) {
    return res.status(403).json({ message: "Owner access required" });
  }
  next();
};
