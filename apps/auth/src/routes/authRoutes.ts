import { Router } from "express";
import { userLogin, userVerifyOtp } from "../controllers/auth.Controller";

const router = Router();

router.post("/login", userLogin);
router.post("/verify-otp", userVerifyOtp);

export default router;
