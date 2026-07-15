import { Request, Response } from "express";
import * as donationService from "../services/donationService";

export const getPublic = async (req: Request, res: Response) => {
  try {
    const donations = await donationService.getPublicDonations(Number(req.query.limit) || undefined);
    res.json(donations);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const registerManual = async (req: Request, res: Response) => {
  try {
    const { userId, donorName, amount } = req.body;
    const donation = await donationService.registerManualDonation({ userId, donorName, amount: Number(amount) });
    res.status(201).json(donation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const mercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const paymentId =
      (req.query["data.id"] as string) ||
      (req.body?.data?.id as string) ||
      (req.query.id as string);

    if (paymentId && (req.query.type === "payment" || req.body?.type === "payment" || !req.query.type)) {
      await donationService.processMercadoPagoPayment(String(paymentId));
    }
  } catch (error: any) {
    console.error("💥 Erro processando webhook do Mercado Pago:", error);
  }
  res.sendStatus(200);
};
