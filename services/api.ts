import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { API_CONFIG } from '@/config/api';

export const AUTH_STORAGE_KEY = '@ecotrack/auth';

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (raw && config.headers) {
    const { token } = JSON.parse(raw) as { token?: string };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
