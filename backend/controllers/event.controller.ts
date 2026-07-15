import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as eventService from "../services/eventService";
import { getRawField } from "../services/fieldService";

const canManageField = (field: any, req: AuthRequest) => {
  const isAdmin = req.user?.roles?.includes("ADMIN");
  const isOwner = (field?.owners || []).some((o: any) => o.id === req.user?.id);
  return Boolean(isAdmin || isOwner);
};

const isFieldOwner = (field: any, req: AuthRequest) => {
  return (field?.owners || []).some((o: any) => o.id === req.user?.id);
};

export const listByField = async (req: AuthRequest, res: Response) => {
  try {
    const field = await getRawField(req.params.id);
    if (!field) return res.status(404).json({ error: "Campo não encontrado" });
    const canSeeAll = canManageField(field, req);
    const events = await eventService.getEventsByField(req.params.id, canSeeAll);
    res.json(events);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    if (!req.body.date || !req.body.start_time) {
      return res.status(400).json({ error: "Data e horário de início são obrigatórios." });
    }
    const event = await eventService.createEvent(req.params.id, userId, req.body);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const raw = await eventService.getRawEvent(req.params.id);
    if (!raw) return res.status(404).json({ error: "Partida não encontrada" });
    const canManage = canManageField(raw.field, req) || raw.creator?.id === req.user?.id;
    const event = await eventService.getEventById(req.params.id, canManage);
    res.json(event);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const raw = await eventService.getRawEvent(req.params.id);
    if (!raw) return res.status(404).json({ error: "Partida não encontrada" });
    if (!isFieldOwner(raw.field, req)) {
      return res.status(403).json({ error: "Apenas o dono do campo pode confirmar partidas." });
    }
    const event = await eventService.setEventStatus(req.params.id, req.body.status);
    res.json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const join = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || null;
    const { name, needs_rental, invite_token } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Informe seu nome / callsign." });
    }
    const event = await eventService.joinEvent(
      req.params.id,
      userId,
      name.trim(),
      needs_rental === true || needs_rental === "true",
      invite_token
    );
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const leave = async (req: AuthRequest, res: Response) => {
  try {
    const participant = await eventService.getParticipant(req.params.id, req.params.pid);
    if (!participant) return res.status(404).json({ error: "Inscrição não encontrada" });

    const isSelf = participant.user?.id && participant.user.id === req.user?.id;
    if (!isSelf) {
      return res.status(403).json({ error: "Apenas quem se inscreveu pode retirar o próprio nome da lista." });
    }

    await eventService.leaveEvent(req.params.id, req.params.pid);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const raw = await eventService.getRawEvent(req.params.id);
    if (!raw) return res.status(404).json({ error: "Partida não encontrada" });
    const isCreator = raw.creator?.id === req.user?.id;
    if (!canManageField(raw.field, req) && !isCreator) {
      return res.status(403).json({ error: "Acesso negado." });
    }
    await eventService.deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
