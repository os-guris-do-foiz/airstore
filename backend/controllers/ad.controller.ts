import { Request, Response } from "express";
import * as adService from "../services/adservice";

export const getAll = async (req: Request, res: Response) => {
  try {
    const ads = await adService.getAllAds(req.query);
    res.json(ads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const ad = await adService.getAdById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Anúncio não encontrado" });
    res.json(ad);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });

    // O Multer vai ler o FormData e colocar os textos aqui:
    const adData = { ...req.body };

    // O Multer vai salvar as fotos no PC e colocar as informações delas aqui:
    if (req.files && req.files.length > 0) {
      // Criamos a URL exata para o frontend achar a imagem depois
      adData.images = req.files.map((file: any) => `http://localhost:3000/uploads/${file.filename}`);
    }

    const ad = await adService.createAd(userId, adData);
    res.status(201).json(ad);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: any, res: Response) => {
  try {
    const adData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      adData.images = req.files.map((file: any) => `http://localhost:3000/uploads/${file.filename}`);
    }
    
    const ad = await adService.updateAd(req.params.id, adData);
    res.json(ad);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAd = async (req: any, res: Response) => {
  try {
    const success = await adService.deleteAd(req.params.id);
    if (!success) return res.status(404).json({ error: "Anúncio não encontrado" });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsSold = async (req: any, res: Response) => {
  try {
    const ad = await adService.markAdAsSold(req.params.id);
    res.json(ad);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};