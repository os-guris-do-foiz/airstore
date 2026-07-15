import { api } from './apiClient';

export const REAIS_PER_WEEK = 10;

export interface Donation {
  id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  donor_name: string;
  donor_avatar: string | null;
  is_premium: boolean;
}

export const donationsApi = {
  getMural: (limit = 20) => api.get<Donation[]>('/donations', { params: { limit } }),

  registerManual: (data: { userId?: string; donorName?: string; amount: number }) =>
    api.post<Donation>('/donations/manual', data),
};
