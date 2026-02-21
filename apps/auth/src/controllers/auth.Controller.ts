import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/postgresql.config";
import { redis } from "../config/redis.config";
import { generateOtp } from "../utils/generateOtp";
import { generateToken } from "../utils/generateToken";
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  console.log(req.body);
  const { mobileNumber } = req.body;
  console.log("Setting cookie for:", req.headers.origin);
  if (!mobileNumber || mobileNumber.length !== 13) {
    throw new AppError("Mobile number is required and must be 10 digits", 400);
  }
  const otp = generateOtp();
  await redis.set(`otp:${mobileNumber}`, otp, "EX", 300);
  console.log(`OTP for ${mobileNumber}: ${otp}`);
  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
});

export const userVerifyOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { mobileNumber, otp, role } = req.body;
    console.log(req.body);

    const storedOtp = await redis.get(`otp:${mobileNumber}`);

    if (!storedOtp) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await redis.del(`otp:${mobileNumber}`);

    let user = await prisma.user.findUnique({
      where: { phone: mobileNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: mobileNumber,
          roles: {
            set: role,
          },
          isVerified: true,
        },
      });
    }
    console.log(user);

    const token = generateToken(user.id, user.roles, user.currentRole!);
    res.cookie("parkbuddy_token", token, {
      httpOnly: true,
      secure: false, // must be false in HTTP
      sameSite: "lax", // change from strict
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user,
      message: "OTP verified successfully",
    });
  },
);
