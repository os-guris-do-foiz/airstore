import { api } from './apiClient';
import { Paginated } from '../types';

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  type: 'AD' | 'FIELD' | 'USER' | 'SYSTEM';
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
  updated_at: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateReportPayload {
  target_id: string;
  type: 'AD' | 'FIELD' | 'USER' | 'SYSTEM';
  reason: string;
  description?: string;
}

export const reportsApi = {
  create: (payload: CreateReportPayload) =>
    api.post<{ message: string; report: Report }>('/reports', payload),

  getAll: (params?: { status?: 'PENDING' | 'RESOLVED' | 'DISMISSED'; type?: Report['type']; page?: number; limit?: number }) =>
    api.get<Paginated<Report>>('/reports', { params: params as any }),

  getStats: () => api.get<{ total: number; pending: number; resolved: number; dismissed: number }>('/reports/stats'),

  updateStatus: (id: string, status: 'RESOLVED' | 'DISMISSED') =>
    api.patch<{ message: string; report: Report }>(`/reports/${id}/status`, { status })
};
