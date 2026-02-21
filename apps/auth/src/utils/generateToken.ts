import jwt from "jsonwebtoken";

export const generateToken = (
  userId: string,
  roles: string[],
  currentRole?: string,
) => {
  return jwt.sign({ userId, roles, currentRole }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};
