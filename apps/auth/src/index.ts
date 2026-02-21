import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { AppError } from "./utils/AppError";
import { errorHandler } from "./middlewares/error.middleware";
import { prisma } from "db";
import cookieParser from "cookie-parser";

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
  }
}

testConnection();
dotenv.config();

const PORT = process.env.PORT || 3007;

export const app = express();
app.use(
  cors({
    origin: ["http://10.199.124.131:5173", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.listen(3007, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
