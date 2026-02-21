import { Router } from "express";
import { becomeOwner, getMe ,  } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.patch("/become-owner", authMiddleware, becomeOwner);

export default router;