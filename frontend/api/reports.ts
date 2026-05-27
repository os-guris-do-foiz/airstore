import { api } from './apiClient';

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

export const reportsApi = {
  getAll: () => 
    api.get<Report[]>('/reports', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    }),
    
  updateStatus: (id: string, status: 'RESOLVED' | 'DISMISSED') => 
    api.patch<{ message: string; report: Report }>(`/reports/${id}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fronteira_token')}`
      }
    })
};
