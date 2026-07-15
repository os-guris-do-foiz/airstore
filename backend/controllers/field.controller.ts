import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as fieldService from "../services/fieldService";
import { getUserAuth } from "../services/userService";
import { processAndStoreImage, processAndStoreImages } from "../services/imageService";

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const page = await fieldService.getAllFields(req.query);
    res.json(page);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getStats = async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await fieldService.getFieldStats());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const field = await fieldService.getFieldById(req.params.id);
    if (!field) return res.status(404).json({ error: "Campo não encontrado" });
    res.json(field);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getMine = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    const fields = await fieldService.getFieldsByOwner(userId);
    res.json(fields);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const collectImages = async (req: any, data: any) => {
  delete data.images;
  delete data.cover;
  const files = req.files || {};
  if (files.images && files.images.length > 0) {
    data.images = await processAndStoreImages(files.images.map((file: any) => file.buffer));
  }
  if (files.cover && files.cover[0]) {
    data.cover = await processAndStoreImage(files.cover[0].buffer);
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });

    const auth = await getUserAuth(userId);
    if (!auth) return res.status(401).json({ error: "Não autorizado" });
    const isAdmin = auth.roles.includes("ADMIN");
    const isOwner = auth.roles.includes("FIELD_OWNER");
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Você não tem permissão para criar campos." });
    }

    const data = { ...req.body };
    await collectImages(req, data);

    if (!isAdmin) {
      const limit = auth.field_limit;
      const owned = await fieldService.countOwnedFields(userId);
      if (limit <= 0) {
        return res.status(403).json({ error: "Você ainda não tem um limite de campos. Peça a um Administrador para liberar." });
      }
      if (owned >= limit) {
        return res.status(403).json({ error: `Limite de campos atingido (${owned}/${limit}). Fale com um Administrador para aumentar.` });
      }
      data.owner_ids = JSON.stringify([userId]);
    }

    const field = await fieldService.createField(data);
    res.status(201).json(field);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const raw = await fieldService.getRawField(req.params.id);
    if (!raw) return res.status(404).json({ error: "Campo não encontrado" });

    const isAdmin = req.user?.roles?.includes("ADMIN");
    const isOwner = (raw.owners || []).some((o) => o.id === req.user?.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Acesso negado: você não é o dono deste campo." });
    }

    const data = { ...req.body };
    await collectImages(req, data);
    if (!isAdmin) delete data.owner_ids;

    const field = await fieldService.updateField(req.params.id, data);
    res.json(field);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const success = await fieldService.deleteField(req.params.id);
    if (!success) return res.status(404).json({ error: "Campo não encontrado" });
    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
