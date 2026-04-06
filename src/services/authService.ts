import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  role: string;
  restaurantId: string;
  fullName?: string;
  abbreviation?: string; // from the JWT payload
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
  message: string;
}

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; data: null; message: string }>('/auth/forgot-password', { email });
    return response.data;
  },
};
