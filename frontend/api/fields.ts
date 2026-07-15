import { api } from './apiClient';
import { Paginated } from '../types';

export interface FieldOwner {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

export interface Field {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string | null;
  base_price: number;
  rental_price: number;
  whatsapp: string | null;
  cover: string | null;
  images: string[];
  rules: string[];
  infrastructure: string[];
  owners: FieldOwner[];
  owner_ids: string[];
  owner_names: string[];
  created_at: string;
}

export interface EventParticipant {
  id: string;
  name: string;
  needs_rental: boolean;
  user_id: string | null;
  created_at: string;
}

export type EventVisibility = "PUBLIC" | "PRIVATE";
export type EventStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface FieldEvent {
  id: string;
  field_id: string;
  field_name: string | null;
  creator_id: string | null;
  creator_name: string | null;
  title: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  visibility: EventVisibility;
  max_players: number;
  status: EventStatus;
  invite_token?: string;
  players_count: number;
  rentals_count: number;
  participants: EventParticipant[];
  created_at: string;
}

export interface CreateEventInput {
  title?: string;
  date: string;
  start_time: string;
  end_time?: string;
  visibility: EventVisibility;
  max_players: number;
}

export interface JoinEventInput {
  name: string;
  needs_rental: boolean;
  invite_token?: string;
}

export const fieldsApi = {
  getAll: (params?: { search?: string; ownerFilter?: 'owned' | 'unowned'; page?: number; limit?: number }) =>
    api.get<Paginated<Field>>('/fields', { params: params as any }),

  getStats: () => api.get<{ total: number; unowned: number }>('/fields/stats'),
  getById: (id: string) => api.get<Field>(`/fields/${id}`),
  getMine: () => api.get<Field[]>('/fields/mine'),
  create: (data: FormData) => api.post<Field>('/fields', data),
  update: (id: string, data: FormData | Partial<Field>) => api.put<Field>(`/fields/${id}`, data),
  delete: (id: string) => api.delete(`/fields/${id}`),
};

export const eventsApi = {
  listByField: (fieldId: string) => api.get<FieldEvent[]>(`/fields/${fieldId}/events`),
  create: (fieldId: string, data: CreateEventInput) => api.post<FieldEvent>(`/fields/${fieldId}/events`, data),
  getById: (id: string) => api.get<FieldEvent>(`/events/${id}`),
  updateStatus: (id: string, status: EventStatus) => api.patch<FieldEvent>(`/events/${id}/status`, { status }),
  join: (id: string, data: JoinEventInput) => api.post<FieldEvent>(`/events/${id}/join`, data),
  leave: (eventId: string, participantId: string) => api.delete(`/events/${eventId}/participants/${participantId}`),
  delete: (id: string) => api.delete(`/events/${id}`),
};
