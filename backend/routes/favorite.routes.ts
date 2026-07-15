import { Router } from "express";
import * as favoriteController from "../controllers/favorite.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, favoriteController.list);        // anúncios favoritados (paginado)
router.get("/ids", authenticate, favoriteController.listIds);  // só os IDs (pra marcar corações)
router.post("/:adId/toggle", authenticate, favoriteController.toggle);

export default router;
