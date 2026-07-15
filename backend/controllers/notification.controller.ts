import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as notificationService from "../services/notificationService";

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    const [items, unread] = await Promise.all([
      notificationService.getForUser(userId),
      notificationService.getUnreadCount(userId),
    ]);
    res.json({ items, unread });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    await notificationService.markRead(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Não autorizado" });
    await notificationService.markAllRead(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const sseTicket = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Não autorizado" });
  res.json({ ticket: notificationService.issueSseTicket(userId) });
};

export const stream = async (req: AuthRequest, res: Response) => {
  const ticket = String(req.query.ticket || "");
  const userId = notificationService.consumeSseTicket(ticket);
  if (!userId) return res.status(401).end();

  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // desliga buffering de proxies (nginx)
  });
  (res as any).flushHeaders?.();
  res.write("retry: 5000\n\n");   // dica de reconexão pro cliente
  res.write(": conectado\n\n");   // comentário SSE só pra abrir o fluxo

  notificationService.addSseClient(userId, res);

  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch { /* ignore */ }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    notificationService.removeSseClient(userId, res);
  });
};
