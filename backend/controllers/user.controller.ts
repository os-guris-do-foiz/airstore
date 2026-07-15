import { Request, Response } from "express";
import * as userService from "../services/userService";
import * as adService from "../services/adservice";
import { processAndStoreImage } from "../services/imageService";

export const getAll = async (req: any, res: Response) => {
  try {
    const page = await userService.getAllUsers(
      req.query.search as string | undefined,
      Number(req.query.page) || undefined,
      Number(req.query.limit) || undefined,
      req.query.filter as string | undefined
    );

    const isAdmin = (req.user?.roles || []).includes("ADMIN");
    if (!isAdmin) {
      page.items = page.items.map((u: any) => {
        const { email, ...publicUser } = u;
        return publicUser;
      });
    }

    res.json(page);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getById = async (req: any, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const isSelf = req.user?.id === req.params.id;
    const isAdmin = (req.user?.roles || []).includes("ADMIN");
    if (!isSelf && !isAdmin) {
      const { email, ...publicUser } = user as any;
      return res.json(publicUser);
    }

    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();
    res.json(stats);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getAds = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || undefined;
    const limit = Number(req.query.limit) || undefined;
    const result = await adService.getAdsByUser(req.params.id, page, limit);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const updateRoles = async (req: Request, res: Response) => {
  try {
    const success = await userService.updateUserRoles(req.params.id, req.body.roles, req.body.field_limit);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const success = await userService.updateUserStatus(req.params.id, req.body.status);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ error: "Não autorizado" });
    if (authUserId !== req.params.id) {
      return res.status(403).json({ error: "Você só pode editar o seu próprio perfil." });
    }

    const data = { ...req.body };
    const files = req.files || {};
    if (files.avatar && files.avatar[0]) data.avatar = await processAndStoreImage(files.avatar[0].buffer);
    if (files.banner && files.banner[0]) data.banner = await processAndStoreImage(files.banner[0].buffer);

    const user = await userService.updateProfile(req.params.id, data);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const validateReviewInput = (profileUserId: string, authorUserId: string | undefined, score: any, content: any) => {
  if (!authorUserId) return { status: 401, error: "Não autorizado" };
  if (profileUserId === authorUserId) return { status: 400, error: "Você não pode avaliar o próprio perfil." };
  if (!score || score < 1 || score > 5) return { status: 400, error: "A nota deve ser entre 1 e 5." };
  if (!content || !content.trim()) return { status: 400, error: "O comentário é obrigatório." };
  return null;
};

export const addReview = async (req: any, res: Response) => {
  try {
    const profileUserId = req.params.id;
    const authorUserId = req.user?.id;
    const { score, content } = req.body;

    const invalid = validateReviewInput(profileUserId, authorUserId, score, content);
    if (invalid) return res.status(invalid.status).json({ error: invalid.error });

    const result = await userService.createReview(profileUserId, authorUserId, Number(score), content.trim());
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const editReview = async (req: any, res: Response) => {
  try {
    const profileUserId = req.params.id;
    const authorUserId = req.user?.id;
    const { score, content } = req.body;

    const invalid = validateReviewInput(profileUserId, authorUserId, score, content);
    if (invalid) return res.status(invalid.status).json({ error: invalid.error });

    const result = await userService.editReview(profileUserId, authorUserId, Number(score), content.trim());
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteReview = async (req: any, res: Response) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId) return res.status(401).json({ error: "Não autorizado" });
    const isAdmin = (req.user?.roles || []).includes("ADMIN");

    await userService.deleteReview(req.params.reviewId, requesterId, isAdmin);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};