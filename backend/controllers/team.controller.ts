import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as teamService from "../services/teamService";
import { processAndStoreImage } from "../services/imageService";

const collectFiles = async (req: any, data: any) => {
  const files = req.files || {};
  if (files.avatar && files.avatar[0]) data.avatar = await processAndStoreImage(files.avatar[0].buffer);
  if (files.banner && files.banner[0]) data.banner = await processAndStoreImage(files.banner[0].buffer);
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || undefined;
    const limit = Number(req.query.limit) || undefined;
    res.json(await teamService.getAllTeams(page, limit));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getMine = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Não autorizado" });
    res.json(await teamService.getTeamsByUser(req.user.id));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    if (!team) return res.status(404).json({ error: "Time não encontrado" });
    res.json(team);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Não autorizado" });
    const data = { ...req.body };
    await collectFiles(req, data);
    const team = await teamService.createTeam(req.user.id, data);
    res.status(201).json(team);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const canManage = await teamService.isTeamManager(req.params.id, req.user?.id);
    if (!canManage) return res.status(403).json({ error: "Apenas administradores do time podem editar." });
    const data = { ...req.body };
    await collectFiles(req, data);
    res.json(await teamService.updateTeam(req.params.id, data));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const raw = await teamService.getRawTeam(req.params.id);
    if (!raw) return res.status(404).json({ error: "Time não encontrado" });
    const isSiteAdmin = (req.user?.roles || []).includes("ADMIN");
    const isCreator = raw.creator?.id === req.user?.id;
    if (!isSiteAdmin && !isCreator) return res.status(403).json({ error: "Apenas o criador ou um admin pode excluir o time." });
    await teamService.deleteTeam(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const join = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Não autorizado" });
    const result = await teamService.joinTeam(req.params.id, req.user.id);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const approveMember = async (req: AuthRequest, res: Response) => {
  try {
    const canManage = await teamService.isTeamManager(req.params.id, req.user?.id);
    if (!canManage) return res.status(403).json({ error: "Sem permissão para aprovar membros." });
    await teamService.approveMember(req.params.memberId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const member = await teamService.getRawMember(req.params.memberId);
    if (!member) return res.status(404).json({ error: "Membro não encontrado" });

    const canManage = await teamService.isTeamManager(req.params.id, req.user?.id);
    const isSelf = member.user?.id === req.user?.id;
    if (!canManage && !isSelf) return res.status(403).json({ error: "Sem permissão para remover este membro." });

    await teamService.removeMember(req.params.memberId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const setMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const canManage = await teamService.isTeamManager(req.params.id, req.user?.id);
    if (!canManage) return res.status(403).json({ error: "Sem permissão." });
    await teamService.setMemberRole(req.params.memberId, req.body.role);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const canManageTeam = async (req: AuthRequest, teamId: string) => {
  if ((req.user?.roles || []).includes("ADMIN")) return true;
  return await teamService.isTeamManager(teamId, req.user?.id);
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    if (!(await canManageTeam(req, req.params.id)))
      return res.status(403).json({ error: "Apenas administradores do time podem criar anúncios." });

    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim();
    if (!title) return res.status(400).json({ error: "O título do anúncio é obrigatório." });
    if (!description) return res.status(400).json({ error: "A descrição do anúncio é obrigatória." });

    const data: any = { title, description };
    if ((req as any).file) data.image = await processAndStoreImage((req as any).file.buffer);

    res.status(201).json(await teamService.setAnnouncement(req.params.id, data, true));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    if (!(await canManageTeam(req, req.params.id)))
      return res.status(403).json({ error: "Apenas administradores do time podem editar anúncios." });

    const data: any = {};
    if (req.body.title !== undefined) data.title = (req.body.title || "").trim();
    if (req.body.description !== undefined) data.description = (req.body.description || "").trim();
    if ((req as any).file) data.image = await processAndStoreImage((req as any).file.buffer);

    res.json(await teamService.setAnnouncement(req.params.id, data, false));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    if (!(await canManageTeam(req, req.params.id)))
      return res.status(403).json({ error: "Apenas administradores do time podem apagar anúncios." });
    res.json(await teamService.deleteAnnouncement(req.params.id));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const setFeatured = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Não autorizado" });
    await teamService.setFeaturedTeam(req.user.id, req.body.team_id || null);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
