import { api } from './apiClient';
import { Ad } from '../types';

export const adsApi = {
  getAll: (filters?: { category?: string; search?: string }) => 
    api.get<Ad[]>('/ads', { 
      params: filters as any 
    }),
    
  getById: (id: string) => 
    api.get<Ad>(`/ads/${id}`),
    
  create: (adData: Partial<Ad>) => 
    api.post<Ad>('/ads', adData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    }),

  update: (id: string, adData: Partial<Ad>) => 
    api.put<Ad>(`/ads/${id}`, adData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    }),
    
  delete: (id: string) => 
    api.delete(`/ads/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    })
};
