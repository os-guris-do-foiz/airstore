import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as favoriteService from "../services/favoriteService";

export const toggle = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    const result = await favoriteService.toggleFavorite(userId, req.params.adId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listIds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    res.json(await favoriteService.getFavoriteAdIds(userId));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    const page = Number(req.query.page) || undefined;
    const limit = Number(req.query.limit) || undefined;
    res.json(await favoriteService.getFavoriteAds(userId, page, limit));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
