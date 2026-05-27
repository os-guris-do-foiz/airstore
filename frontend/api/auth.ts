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
    
  register: (userData: { name: string; email: string; password: string }) => 
    api.post<AuthResponse>('/auth/register', userData),
};
