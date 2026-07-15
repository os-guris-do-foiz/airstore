import { api } from './apiClient';
import { Paginated } from '../types';

export type UserRole = "ADMIN" | "FIELD_OWNER" | "PREMIUM" | "USER";
export type UserStatus = "ACTIVE" | "BANNED";
export type UserFilter = "FIELD_OWNER" | "PREMIUM" | "ADMIN" | "BANNED" | "ACTIVE";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  field_limit?: number;
  created_at: string;
  avatar?: string;
  nickname?: string;
  bio?: string;
  is_donor?: boolean;
  donor_expiry?: string | null;
}

export const usersApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number; filter?: UserFilter }) =>
    api.get<Paginated<AppUser>>('/users', { params: params as any }),

  search: (query: string, page = 1, limit = 20) =>
    api.get<Paginated<AppUser>>('/users', { params: { search: query, page, limit } }),

  updateRoles: (id: string, roles: UserRole[], field_limit?: number) =>
    api.patch<AppUser>(`/users/${id}/roles`, { roles, field_limit }),

  updateStatus: (id: string, status: UserStatus) =>
    api.patch<AppUser>(`/users/${id}/status`, { status }),

  getProfile: (id: string) => api.get<any>(`/users/${id}`),

  getStats: () => api.get<{ total: number; fieldOwners: number; premium: number; admins: number; banned: number; active: number }>('/users/stats'),

  updateProfile: (id: string, data: FormData) =>
    api.put<any>(`/users/${id}/profile`, data),

  addReview: (id: string, review: { score: number; content: string }) =>
    api.post<{ avgRating: number; reviewsCount: number }>(`/users/${id}/reviews`, review),

  editReview: (id: string, review: { score: number; content: string }) =>
    api.put<{ avgRating: number; reviewsCount: number }>(`/users/${id}/reviews`, review),

  deleteReview: (id: string, reviewId: string) =>
    api.delete(`/users/${id}/reviews/${reviewId}`),
};
