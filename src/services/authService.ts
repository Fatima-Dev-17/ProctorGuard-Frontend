import api from './api';
import { API_ENDPOINTS } from '../utils/config';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface VerificationEmailData {
  email: string;
  name: string;
  code: string;
}

export const authService = {
  signup: async (data: SignupData) => {
    const response = await api.post(API_ENDPOINTS.SIGNUP, data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  sendVerificationEmail: async (data: VerificationEmailData) => {
    const response = await api.post(API_ENDPOINTS.SEND_VERIFICATION, data);
    return response.data;
  },

  getProfile: async (userId: string) => {
    const response = await api.get(`${API_ENDPOINTS.PROFILE}/${userId}`);
    return response.data;
  },

  // Local storage helpers
  saveUser: (userData: UserData) => {
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userFullName', userData.fullName);
  },

  getUser: (): UserData | null => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const fullName = localStorage.getItem('userFullName');

    if (userId && role && email && fullName) {
      return { userId, email, fullName, role };
    }
    return null;
  },

  clearUser: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('userId') !== null;
  },
};