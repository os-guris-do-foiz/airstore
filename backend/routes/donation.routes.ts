import { Router } from "express";
import * as donationController from "../controllers/donation.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit.middleware";

const router = Router();

router.get("/", donationController.getPublic);
router.post("/manual", authenticate, authorize(["ADMIN"]), donationController.registerManual);

const webhookLimiter = rateLimit(60 * 1000, 60, "Muitas notificações em pouco tempo.");
router.post("/webhook/mercadopago", webhookLimiter, donationController.mercadoPagoWebhook);

export default router;
