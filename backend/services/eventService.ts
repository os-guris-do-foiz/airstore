import { AppDataSource } from "../db/index";
import { In } from "typeorm";
import { Event } from "../domains/event";
import { EventParticipant } from "../domains/eventParticipant";
import { getRawField } from "./fieldService";
import { notify } from "./notificationService";
import { randomInviteToken } from "../utils/id";

const formatParticipant = (p: EventParticipant) => ({
  id: p.id,
  name: p.name,
  needs_rental: p.needs_rental,
  user_id: p.user?.id ?? null,
  created_at: p.created_at,
});

const formatEvent = (event: Event | null, participants: EventParticipant[] = [], hideToken = true) => {
  if (!event) return event;
  const { creator, field, invite_token, ...rest } = event as any;
  const rentals = participants.filter((p) => p.needs_rental).length;

  return {
    ...rest,
    field_id: field?.id ?? null,
    field_name: field?.name ?? null,
    creator_id: creator?.id ?? null,
    creator_name: creator?.name ?? null,
    invite_token: hideToken ? undefined : invite_token,
    players_count: participants.length,
    rentals_count: rentals,
    participants: participants.map(formatParticipant),
  };
};

const eventRepo = () => AppDataSource.getRepository<Event>("Event");
const participantRepo = () => AppDataSource.getRepository<EventParticipant>("EventParticipant");

const loadParticipants = async (eventId: string) => {
  return await participantRepo().find({
    where: { event: { id: eventId } },
    relations: { user: true },
    order: { created_at: "ASC" },
  });
};

const loadParticipantsByEvents = async (eventIds: string[]) => {
  const map = new Map<string, EventParticipant[]>();
  if (eventIds.length === 0) return map;
  const all = await participantRepo().find({
    where: { event: { id: In(eventIds) } },
    relations: { user: true, event: true },
    order: { created_at: "ASC" },
  });
  for (const p of all) {
    const key = (p as any).event?.id;
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return map;
};

const MAX_EVENTS_PER_FIELD = 200;

export const getEventsByField = async (fieldId: string, canSeeAll: boolean) => {
  const recent = await eventRepo().find({
    where: { field: { id: fieldId } },
    relations: { creator: true, field: true },
    order: { date: "DESC", start_time: "DESC" },
    take: MAX_EVENTS_PER_FIELD,
  });
  const events = recent.reverse(); // volta pra ordem ASC que os consumidores esperam

  const visible = canSeeAll
    ? events
    : events.filter((e) => e.status === "APPROVED" && e.visibility === "PUBLIC");

  const byEvent = await loadParticipantsByEvents(visible.map((e) => e.id));
  return visible.map((e) => formatEvent(e, byEvent.get(e.id) || [], !canSeeAll));
};

export const getEventById = async (id: string, revealToken = false) => {
  const event = await eventRepo().findOne({
    where: { id },
    relations: { creator: true, field: { owners: true } },
  });
  if (!event) return null;
  const participants = await loadParticipants(id);
  return formatEvent(event, participants, !revealToken);
};

const parseMaxPlayers = (raw: any) => {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return 30;
  return Math.min(Math.max(n, 2), 500);
};

export const createEvent = async (fieldId: string, creatorId: string, data: any) => {
  const field = await getRawField(fieldId);
  if (!field) throw new Error("Campo não encontrado.");

  const visibility = data.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  const invite_token = visibility === "PRIVATE" ? randomInviteToken() : null;

  const event = eventRepo().create({
    field: { id: fieldId },
    creator: { id: creatorId },
    title: data.title || null,
    date: data.date,
    start_time: data.start_time,
    end_time: data.end_time || null,
    visibility,
    max_players: parseMaxPlayers(data.max_players),
    status: "PENDING",
    invite_token,
  }) as unknown as Event;

  await eventRepo().save(event);

  const label = data.title ? `"${data.title}"` : "uma nova partida";
  for (const owner of field.owners || []) {
    await notify(
      owner.id,
      "EVENT_PENDING",
      `${label} aguarda sua aprovação em ${field.name}.`,
      "/painel-campo"
    );
  }

  return await getEventById(event.id, true);
};

export const getRawEvent = async (id: string) => {
  return await eventRepo().findOne({
    where: { id },
    relations: { creator: true, field: { owners: true } },
  });
};

export const setEventStatus = async (id: string, status: string) => {
  const clean = ["APPROVED", "REJECTED", "PENDING"].includes(status) ? status : "PENDING";
  const raw = await getRawEvent(id);
  await eventRepo().update(id, { status: clean });

  if (raw?.creator?.id && (clean === "APPROVED" || clean === "REJECTED")) {
    const label = raw.title ? `"${raw.title}"` : "Sua partida";
    const fieldName = raw.field?.name ?? "";
    if (clean === "APPROVED") {
      await notify(raw.creator.id, "EVENT_APPROVED", `${label} foi aprovada em ${fieldName}! 🎯`, `/campos/${raw.field?.id}`);
    } else {
      await notify(raw.creator.id, "EVENT_REJECTED", `${label} foi rejeitada em ${fieldName}.`, `/campos/${raw.field?.id}`);
    }
  }

  return await getEventById(id, true);
};

export const joinEvent = async (
  eventId: string,
  userId: string | null,
  name: string,
  needsRental: boolean,
  inviteToken?: string
) => {
  await AppDataSource.transaction(async (manager) => {
    const event = await manager.getRepository(Event).findOne({
      where: { id: eventId },
      lock: { mode: "pessimistic_write" },
    });
    if (!event) throw new Error("Partida não encontrada.");
    if (event.status !== "APPROVED") throw new Error("Esta partida ainda não foi confirmada pelo dono do campo.");

    if (event.visibility === "PRIVATE" && event.invite_token !== inviteToken) {
      throw new Error("Esta é uma partida privada. É necessário um link de convite válido.");
    }

    const participantsRepo = manager.getRepository(EventParticipant);
    const count = await participantsRepo.count({ where: { event: { id: eventId } } });
    if (count >= event.max_players) {
      throw new Error("Esta partida está lotada.");
    }
    if (userId) {
      const already = await participantsRepo.findOne({
        where: { event: { id: eventId }, user: { id: userId } },
      });
      if (already) throw new Error("Você já está inscrito nesta partida.");
    }

    await participantsRepo.save(participantsRepo.create({
      event: { id: eventId },
      user: userId ? { id: userId } : null,
      name,
      needs_rental: needsRental,
    }) as unknown as EventParticipant);
  });

  return await getEventById(eventId, false);
};

export const getParticipant = async (eventId: string, participantId: string) => {
  return await participantRepo().findOne({
    where: { id: participantId, event: { id: eventId } },
    relations: { user: true, event: { field: { owners: true } } },
  });
};

export const leaveEvent = async (eventId: string, participantId: string) => {
  const result = await participantRepo().delete({ id: participantId, event: { id: eventId } } as any);
  return result.affected !== 0;
};

export const deleteEvent = async (id: string) => {
  const result = await eventRepo().delete(id);
  return result.affected !== 0;
};
