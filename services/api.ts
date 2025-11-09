import { API_CONFIG } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TOKEN_KEY = '@ecotrack_token';
const USER_KEY = '@ecotrack_user';

// configuração básica do axios
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptador para adicionar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// interceptador para tratar erros 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthData();
    }
    return Promise.reject(error);
  }
);

// funções para gerenciar autenticação
export async function saveAuthData(token: string, user: any): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getAuthUser(): Promise<any | null> {
  const userStr = await AsyncStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export async function clearAuthData(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

