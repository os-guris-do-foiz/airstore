import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();


router.get("/", userController.getAll);
router.get("/:id", userController.getById);

router.post("/:id/comments", authenticate, userController.addComment);
router.post("/:id/ratings", authenticate, userController.addRating);

export default router;