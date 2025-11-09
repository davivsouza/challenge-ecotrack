import { api, clearAuthData, saveAuthData } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// serviço de autenticação
export const authService = {
  // faz login buscando usuário por email
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await api.get(API_ENDPOINTS.USER_BY_EMAIL(credentials.email));
      const { _links, ...userData } = response.data || {};
      
      const user: User = {
        id: userData.id,
        name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Usuário',
        email: userData.email,
        avatar: userData.avatar,
      };
      
      await saveAuthData('mock-token', user);
      return user;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Email ou senha incorretos');
      }
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  },

  // cadastra novo usuário
  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await api.post(API_ENDPOINTS.USERS, {
        id: null,
        email: data.email,
        passwordHash: data.password,
        displayName: data.displayName,
      });
      
      const { _links, ...userData } = response.data || {};
      
      const user: User = {
        id: userData.id,
        name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Usuário',
        email: userData.email,
        avatar: userData.avatar,
      };
      
      await saveAuthData('mock-token', user);
      return user;
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Email já cadastrado');
      }
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar usuário');
    }
  },

  // faz logout
  async logout(): Promise<void> {
    await clearAuthData();
  },

  // verifica se está autenticado
  async isAuthenticated(): Promise<boolean> {
    const { getAuthToken } = await import('@/services/api');
    const token = await getAuthToken();
    return !!token;
  },
};

