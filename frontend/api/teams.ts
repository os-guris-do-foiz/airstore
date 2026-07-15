import { api } from './apiClient';
import { Paginated } from '../types';

export type TeamVisibility = "PUBLIC" | "PRIVATE";
export type MemberRole = "ADMIN" | "MEMBER";
export type MemberStatus = "ACTIVE" | "PENDING";

export interface TeamMember {
  id: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
  user_id: string | null;
  user: { id: string; name: string; avatar: string | null; nickname: string | null } | null;
}

export interface TeamAnnouncement {
  title: string | null;
  description: string | null;
  image: string | null;
  created_at: string;
  expires_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  visibility: TeamVisibility;
  notice: string | null;
  invite_token?: string | null;
  creator_id: string | null;
  creator_name: string | null;
  member_count: number;
  members: TeamMember[];
  announcement: TeamAnnouncement | null;
  created_at: string;
  my_role?: MemberRole;
  my_status?: MemberStatus;
}

export const MAX_TEAMS = 3;

export const teamsApi = {
  getAll: (page = 1, limit = 20) => api.get<Paginated<Team>>('/teams', { params: { page, limit } }),
  getMine: () => api.get<Team[]>('/teams/mine'),
  getById: (id: string) => api.get<Team>(`/teams/${id}`),
  create: (data: FormData) => api.post<Team>('/teams', data),
  update: (id: string, data: FormData) => api.put<Team>(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),

  join: (id: string) => api.post<{ pending: boolean }>(`/teams/${id}/join`),
  approveMember: (id: string, memberId: string) => api.patch(`/teams/${id}/members/${memberId}/approve`),
  setMemberRole: (id: string, memberId: string, role: MemberRole) => api.patch(`/teams/${id}/members/${memberId}/role`, { role }),
  removeMember: (id: string, memberId: string) => api.delete(`/teams/${id}/members/${memberId}`),

  setFeatured: (teamId: string | null) => api.patch('/teams/featured', { team_id: teamId }),

  createAnnouncement: (id: string, data: FormData) => api.post<Team>(`/teams/${id}/announcement`, data),
  updateAnnouncement: (id: string, data: FormData) => api.put<Team>(`/teams/${id}/announcement`, data),
  deleteAnnouncement: (id: string) => api.delete<Team>(`/teams/${id}/announcement`),
};
