import { AppDataSource } from "../db/index";
import { In } from "typeorm";
import { Team } from "../domains/team";
import { TeamMember } from "../domains/teamMember";
import { User } from "../domains/user";
import { parsePagination, buildPage } from "../utils/pagination";
import { randomInviteToken } from "../utils/id";

export const MAX_TEAMS = 3;

const teamRepo = () => AppDataSource.getRepository<Team>("Team");
const memberRepo = () => AppDataSource.getRepository<TeamMember>("TeamMember");
const userRepo = () => AppDataSource.getRepository<User>("User");

const cleanUser = (u: any) => {
  if (!u) return null;
  const { password_hash, email, ...rest } = u;
  return rest;
};

const formatMember = (m: TeamMember) => ({
  id: m.id,
  role: m.role,
  status: m.status,
  created_at: m.created_at,
  user_id: m.user?.id ?? null,
  user: m.user ? { id: m.user.id, name: m.user.name, avatar: m.user.avatar ?? null, nickname: m.user.nickname ?? null } : null,
});

const AD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const buildAnnouncement = (title: any, description: any, image: any, created_at: any) => {
  if (!created_at) return null;
  const created = new Date(created_at);
  const expires = new Date(created.getTime() + AD_TTL_MS);
  if (expires.getTime() <= Date.now()) return null; // expirou
  return {
    title: title || null,
    description: description || null,
    image: image || null,
    created_at,
    expires_at: expires.toISOString(),
  };
};

const formatTeam = (team: Team | null, members: TeamMember[] = []) => {
  if (!team) return team;
  const { creator, ad_title, ad_description, ad_image, ad_created_at, ...rest } = team as any;
  const active = members.filter((m) => m.status === "ACTIVE");
  return {
    ...rest,
    creator_id: creator?.id ?? null,
    creator_name: creator?.name ?? null,
    creator: cleanUser(creator),
    member_count: active.length,
    members: members.map(formatMember),
    announcement: buildAnnouncement(ad_title, ad_description, ad_image, ad_created_at),
  };
};

const loadMembers = async (teamId: string) =>
  memberRepo().find({
    where: { team: { id: teamId } },
    relations: { user: true },
    order: { created_at: "ASC" },
  });

const loadMembersByTeams = async (teamIds: string[]) => {
  const map = new Map<string, TeamMember[]>();
  if (teamIds.length === 0) return map;
  const all = await memberRepo().find({
    where: { team: { id: In(teamIds) } },
    relations: { user: true, team: true },
    order: { created_at: "ASC" },
  });
  for (const m of all) {
    const key = (m as any).team?.id;
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return map;
};

export const getAllTeams = async (page?: number, limit?: number) => {
  const { page: p, limit: l, skip } = parsePagination({ page, limit });
  const [teams, total] = await teamRepo().findAndCount({
    relations: { creator: true },
    order: { created_at: "DESC" },
    skip,
    take: l,
  });
  const byTeam = await loadMembersByTeams(teams.map((t) => t.id));
  const result = teams.map((t) => formatTeam(t, byTeam.get(t.id) || []));
  return buildPage(result, total, p, l);
};

export const getTeamById = async (id: string) => {
  const team = await teamRepo().findOne({ where: { id }, relations: { creator: true } });
  if (!team) return null;
  const members = await loadMembers(id);
  return formatTeam(team, members);
};

export const getRawTeam = async (id: string) =>
  teamRepo().findOne({ where: { id }, relations: { creator: true } });

export const getTeamsByUser = async (userId: string, includePending = true) => {
  const memberships = await memberRepo().find({
    where: { user: { id: userId } },
    relations: { team: { creator: true } },
    order: { created_at: "DESC" },
  });
  const relevant = memberships.filter((m) => m.team && (includePending || m.status === "ACTIVE"));
  const byTeam = await loadMembersByTeams(relevant.map((m) => m.team.id));
  return relevant.map((m) => ({
    ...formatTeam(m.team, byTeam.get(m.team.id) || []),
    my_role: m.role,
    my_status: m.status,
  }));
};

export const countActiveTeams = async (userId: string) => {
  const memberships = await memberRepo().find({ where: { user: { id: userId }, status: "ACTIVE" } });
  return memberships.length;
};

export const isTeamManager = async (teamId: string, userId?: string) => {
  if (!userId) return false;
  const m = await memberRepo().findOne({ where: { team: { id: teamId }, user: { id: userId }, role: "ADMIN", status: "ACTIVE" } });
  return !!m;
};

const parseInput = (data: any) => {
  const out: any = {};
  ["name", "description", "notice", "avatar", "banner"].forEach((k) => {
    if (data[k] !== undefined) out[k] = data[k];
  });
  if (data.visibility !== undefined) out.visibility = data.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  return out;
};

export const createTeam = async (creatorId: string, data: any) => {
  const payload = parseInput(data);
  if (!payload.name) throw new Error("O nome do time é obrigatório.");

  const count = await countActiveTeams(creatorId);
  if (count >= MAX_TEAMS) throw new Error(`Você já participa de ${MAX_TEAMS} times (limite máximo). Saia de um antes de criar outro.`);
  const invite_token = payload.visibility === "PRIVATE" ? randomInviteToken() : null;

  const team = teamRepo().create({ ...payload, creator: { id: creatorId }, invite_token }) as unknown as Team;
  await teamRepo().save(team);

  await memberRepo().save(memberRepo().create({
    team: { id: team.id },
    user: { id: creatorId },
    role: "ADMIN",
    status: "ACTIVE",
  }));

  return await getTeamById(team.id);
};

export const updateTeam = async (id: string, data: any) => {
  const payload = parseInput(data);
  if (payload.visibility === "PRIVATE") {
    const raw = await getRawTeam(id);
    if (raw && !raw.invite_token) payload.invite_token = randomInviteToken();
  }
  if (Object.keys(payload).length > 0) await teamRepo().update(id, payload);
  return await getTeamById(id);
};

export const deleteTeam = async (id: string) => {
  const result = await teamRepo().delete(id);
  return result.affected !== 0;
};

export const joinTeam = async (teamId: string, userId: string) => {
  const team = await getRawTeam(teamId);
  if (!team) throw new Error("Time não encontrado.");

  const existing = await memberRepo().findOne({ where: { team: { id: teamId }, user: { id: userId } } });
  if (existing) {
    if (existing.status === "PENDING") throw new Error("Sua solicitação já está aguardando aprovação.");
    throw new Error("Você já faz parte deste time.");
  }

  const isPrivate = team.visibility === "PRIVATE";
  if (!isPrivate) {
    const count = await countActiveTeams(userId);
    if (count >= MAX_TEAMS) throw new Error(`Você já participa de ${MAX_TEAMS} times (limite máximo).`);
  }

  await memberRepo().save(memberRepo().create({
    team: { id: teamId },
    user: { id: userId },
    role: "MEMBER",
    status: isPrivate ? "PENDING" : "ACTIVE",
  }));

  return { pending: isPrivate };
};

export const getRawMember = async (memberId: string) =>
  memberRepo().findOne({ where: { id: memberId }, relations: { user: true, team: true } });

export const approveMember = async (memberId: string) => {
  const m = await getRawMember(memberId);
  if (!m) throw new Error("Solicitação não encontrada.");
  const count = await countActiveTeams(m.user.id);
  if (count >= MAX_TEAMS) throw new Error(`Este operador já participa de ${MAX_TEAMS} times.`);
  await memberRepo().update(memberId, { status: "ACTIVE" });
  return true;
};

export const removeMember = async (memberId: string) => {
  const m = await getRawMember(memberId);
  if (m) {
    const user = await userRepo().findOne({ where: { id: m.user.id } });
    if (user && user.featured_team_id === m.team.id) {
      await userRepo().update(user.id, { featured_team_id: null as any });
    }
  }
  const result = await memberRepo().delete(memberId);
  return result.affected !== 0;
};

export const setMemberRole = async (memberId: string, role: string) => {
  const clean = role === "ADMIN" ? "ADMIN" : "MEMBER";
  await memberRepo().update(memberId, { role: clean });
  return true;
};

export const setAnnouncement = async (teamId: string, data: any, reset: boolean) => {
  const payload: any = {};
  if (data.title !== undefined) payload.ad_title = data.title || null;
  if (data.description !== undefined) payload.ad_description = data.description || null;
  if (data.image !== undefined) payload.ad_image = data.image || null;
  if (reset) {
    payload.ad_created_at = new Date();
    if (payload.ad_image === undefined) payload.ad_image = null; // criação sem imagem
  }
  await teamRepo().update(teamId, payload);
  return await getTeamById(teamId);
};

export const deleteAnnouncement = async (teamId: string) => {
  await teamRepo().update(teamId, {
    ad_title: null as any,
    ad_description: null as any,
    ad_image: null as any,
    ad_created_at: null as any,
  });
  return await getTeamById(teamId);
};

export const setFeaturedTeam = async (userId: string, teamId: string | null) => {
  if (teamId) {
    const m = await memberRepo().findOne({ where: { team: { id: teamId }, user: { id: userId }, status: "ACTIVE" } });
    if (!m) throw new Error("Você precisa ser membro ativo do time para destacá-lo.");
  }
  await userRepo().update(userId, { featured_team_id: (teamId || null) as any });
  return true;
};

export const getFeaturedTeamSummary = async (userId: string) => {
  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user?.featured_team_id) return null;
  const active = await memberRepo().findOne({ where: { team: { id: user.featured_team_id }, user: { id: userId }, status: "ACTIVE" } });
  if (!active) return null;
  const team = await getRawTeam(user.featured_team_id);
  if (!team) return null;
  const members = await loadMembers(team.id);
  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  return { id: team.id, name: team.name, avatar: team.avatar, visibility: team.visibility, member_count: activeCount, my_role: active.role };
};
