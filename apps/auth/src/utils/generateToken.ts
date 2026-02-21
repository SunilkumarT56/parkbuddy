import jwt from "jsonwebtoken";

export const generateToken = (userId: string , roles: string[]) => {
  return jwt.sign(
    { userId , roles },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};