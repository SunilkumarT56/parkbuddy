import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export interface JwtPayload {
  userId: string;
  roles: string[];
}

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};