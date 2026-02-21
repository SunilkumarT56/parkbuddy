import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { prisma } from "db";
import userRoutes from "./routes/user.routes";
import spaceRoutes from "./modules/space/space.routes";
import path from "path";

dotenv.config();

const PORT = process.env.PORT! || 3008;

const app = express();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
  }
}

testConnection();

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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/user", userRoutes);
app.use("/api/spaces", spaceRoutes);

app.get("/api/user/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.listen(3008, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
