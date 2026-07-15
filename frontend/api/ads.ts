import { api } from './apiClient';
import { Ad, Paginated } from '../types';

export const adsApi = {
  getAll: (filters?: {
    category?: string;
    type?: string;
    condition?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'recent' | 'price_asc' | 'price_desc' | 'views';
    page?: number;
    limit?: number;
  }) =>
    api.get<Paginated<Ad>>('/ads', {
      params: filters as any
    }),

  getSpotlight: (limit = 12) =>
    api.get<Ad[]>('/ads/spotlight', { params: { limit } }),

  getByUser: (userId: string, page = 1, limit = 20) =>
    api.get<Paginated<Ad>>(`/users/${userId}/ads`, { params: { page, limit } }),

  getById: (id: string) =>
    api.get<Ad>(`/ads/${id}`),

  registerView: (id: string) =>
    api.post<void>(`/ads/${id}/view`),

  create: (adData: Partial<Ad> | FormData) =>
    api.post<Ad>('/ads', adData),

  update: (id: string, adData: Partial<Ad> | FormData) =>
    api.put<Ad>(`/ads/${id}`, adData),

  delete: (id: string) =>
    api.delete(`/ads/${id}`)
};
