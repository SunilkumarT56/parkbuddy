import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/postgresql.config";
import { generateToken } from "../utils/jwt.utils";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        roles: true,
        isVerified: true,
        createdAt: true,
        currentRole: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const becomeOwner = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If already owner, just return success
    if (user.roles.includes("OWNER")) {
      return res.status(200).json({
        success: true,
        message: "Already an owner",
        user,
      });
    }

    // Add OWNER role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          push: "OWNER",
        },
      },
    });
    if (user.currentRole !== "OWNER") {
      await prisma.user.update({
        where: { id: userId },
        data: { currentRole: "OWNER" },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { currentRole: "DRIVER" },
      });
    }

    const token = generateToken({
      userId: updatedUser.id,
      roles: updatedUser.roles,
    });

    res.cookie("parkbuddy_token", token, {
      httpOnly: true,
      secure: false, // must be false in HTTP
      sameSite: "lax", // change from strict
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Promoted to owner successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Become owner error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
