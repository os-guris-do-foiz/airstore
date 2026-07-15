import { api } from './apiClient';

export interface AuthResponse {
  message: string;
  token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    city: string | null;
    avatar: string | null;
    is_donor: boolean;
  };
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (userData: {
    name: string;
    email: string;
    password: string;
    city?: string;
  }) =>
    api.post<AuthResponse>('/auth/register', userData),

  me: () => api.get<any>('/auth/me'),

  verifyEmail: (email: string, code: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, code }),

  resendCode: (email: string) =>
    api.post<{ message: string }>('/auth/resend-code', { email }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email, code, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword }),
};
