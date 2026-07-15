import { AppDataSource } from "../db/index";
import { Notification } from "../domains/notification";
import { randomInviteToken } from "../utils/id";

const repo = () => AppDataSource.getRepository<Notification>("Notification");

const sseClients = new Map<string, Set<{ write: (s: string) => void }>>();

export const addSseClient = (userId: string, res: { write: (s: string) => void }) => {
  if (!sseClients.has(userId)) sseClients.set(userId, new Set());
  sseClients.get(userId)!.add(res);
};

export const removeSseClient = (userId: string, res: { write: (s: string) => void }) => {
  const set = sseClients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) sseClients.delete(userId);
};

const pushToUser = (userId: string) => {
  const set = sseClients.get(userId);
  if (!set) return;
  const payload = `data: ${JSON.stringify({ event: "new" })}\n\n`;
  for (const res of set) {
    try { res.write(payload); } catch { /* conexão morta é limpa no close */ }
  }
};

const sseTickets = new Map<string, { userId: string; expiresAt: number }>();
const TICKET_TTL_MS = 30 * 1000;

export const issueSseTicket = (userId: string) => {
  const ticket = randomInviteToken();
  sseTickets.set(ticket, { userId, expiresAt: Date.now() + TICKET_TTL_MS });
  return ticket;
};

export const consumeSseTicket = (ticket: string): string | null => {
  const entry = sseTickets.get(ticket);
  if (!entry) return null;
  sseTickets.delete(ticket); // uso único
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
};

export const notify = async (
  recipientId: string,
  type: string,
  message: string,
  link?: string
) => {
  if (!recipientId) return;
  const n = repo().create({
    recipient: { id: recipientId },
    type,
    message,
    link: link || null,
  }) as unknown as Notification;
  await repo().save(n);
  pushToUser(recipientId);
};

export const getForUser = async (userId: string) => {
  return await repo().find({
    where: { recipient: { id: userId } },
    order: { created_at: "DESC" },
    take: 50,
  });
};

export const getUnreadCount = async (userId: string) => {
  return await repo().count({ where: { recipient: { id: userId }, is_read: false } });
};

export const markRead = async (id: string, userId: string) => {
  await repo().update({ id, recipient: { id: userId } } as any, { is_read: true });
  return true;
};

export const markAllRead = async (userId: string) => {
  await repo().update({ recipient: { id: userId }, is_read: false } as any, { is_read: true });
  return true;
};
