import { api } from './apiClient';

export interface AppNotification {
  id: string;
  type: "EVENT_PENDING" | "EVENT_APPROVED" | "EVENT_REJECTED" | "REPORT" | "REPORT_BUG" | "GENERIC";
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: () => api.get<{ items: AppNotification[]; unread: number }>('/notifications'),
  markRead: (id: string) => api.patch<{ success: boolean }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ success: boolean }>(`/notifications/read-all`),
  getSseTicket: () => api.post<{ ticket: string }>(`/notifications/sse-ticket`),
};
