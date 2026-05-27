import { api } from './apiClient';

export type UserRole = "ADMIN" | "FIELD_OWNER" | "PREMIUM" | "USER";
export type UserStatus = "ACTIVE" | "BANNED";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  created_at: string;
  avatar?: string;
}

export const usersApi = {
  getAll: () => 
    api.get<AppUser[]>('/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    }),

  updateRoles: (id: string, roles: UserRole[]) =>
    api.patch<AppUser>(`/users/${id}/roles`, { roles }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    }),

  updateStatus: (id: string, status: UserStatus) =>
    api.patch<AppUser>(`/users/${id}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    }),
    
  getProfile: (id: string) => api.get<any>(`/users/${id}`),
};
