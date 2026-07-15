import { Request, Response } from "express";
import * as adService from "../services/adservice";
import { processAndStoreImages } from "../services/imageService";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = await adService.getAllAds(req.query);
    res.json(page);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getSpotlight = async (req: Request, res: Response) => {
  try {
    const ads = await adService.getSpotlightAds(Number(req.query.limit) || undefined);
    res.json(ads);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const ad = await adService.getAdById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Anúncio não encontrado" });
    res.json(ad);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const create = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });

    const adData = { ...req.body };

    delete adData.images;
    if (req.files && req.files.length > 0) {
      adData.images = await processAndStoreImages(req.files.map((file: any) => file.buffer));
    }

    const ad = await adService.createAd(userId, adData);
    res.status(201).json(ad);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: any, res: Response) => {
  try {
    const existing = await adService.getAdById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Anúncio não encontrado" });

    const isAdmin = req.user?.roles?.includes("ADMIN");
    const isOwner = (existing as any).user_id === req.user?.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Você só pode editar os seus próprios anúncios." });
    }

    const adData = { ...req.body };

    delete adData.images;
    if (req.files && req.files.length > 0) {
      adData.images = await processAndStoreImages(req.files.map((file: any) => file.buffer));
    }

    const ad = await adService.updateAd(req.params.id, adData);
    res.json(ad);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const registerView = async (req: Request, res: Response) => {
  try {
    await adService.incrementAdViews(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Falha ao registrar view:", error);
    res.status(204).send();
  }
};

export const deleteAd = async (req: any, res: Response) => {
  try {
    const ad = await adService.getAdById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Anúncio não encontrado" });

    const isAdmin = req.user?.roles?.includes("ADMIN");
    const isOwner = (ad as any).user_id === req.user?.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Você só pode apagar os seus próprios anúncios." });
    }

    await adService.deleteAd(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};