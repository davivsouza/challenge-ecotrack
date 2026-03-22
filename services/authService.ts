import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, AUTH_STORAGE_KEY } from '@/services/api';
import { AuthResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    return data;
  },
  async me() {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
  async getStoredSession() {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  },
  async logout() {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
