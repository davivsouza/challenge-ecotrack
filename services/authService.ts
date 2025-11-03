import { api, ApiError, clearAuthData, saveAuthData } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

// serviço de autenticação
// nota: a api não tem endpoint de login específico
// usa busca de usuário por email
export const authService = {
  // faz login buscando usuário por email
  async login(credentials: LoginRequest): Promise<User> {
    try {
      // busca usuário por email
      const userResponse = await api.get<User & { displayName?: string; _links?: any }>(
        API_ENDPOINTS.USER_BY_EMAIL(credentials.email)
      );
      
      // extrai dados do usuário (remove _links do HATEOAS se existir)
      // api java usa displayName, não name
      const user: User = {
        id: userResponse.id,
        name: userResponse.displayName || userResponse.name || userResponse.email?.split('@')[0] || 'Usuário',
        email: userResponse.email,
        avatar: userResponse.avatar,
      };
      
      // salva usuário (sem token, pois a API não tem autenticação JWT ainda)
      await saveAuthData('mock-token', user);
      
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error('Email ou senha incorretos');
      }
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Erro ao fazer login');
      }
      throw new Error('Erro de conexão. Tente novamente.');
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

