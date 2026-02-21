import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireOwner } from "../../middlewares/requireOwner.middleware";
import { upload } from "../../middlewares/upload.middleware";
import {
  createSpace,
  getMySpaces,
  updateSpace,
  deleteSpace,
  switchRole,
} from "./space.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireOwner,
  upload.array("images", 5), // max 5 images
  createSpace,
);
router.get("/my-spaces", authMiddleware, requireOwner, getMySpaces);
router.patch("/:id", authMiddleware, requireOwner, updateSpace);
router.delete("/:id", authMiddleware, requireOwner, deleteSpace);
router.post("/switch-role", authMiddleware, requireOwner, switchRole);

export default router;
