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
      // busca usuário por email - api pode retornar em _embedded ou direto
      const userResponse = await api.get<any>(API_ENDPOINTS.USER_BY_EMAIL(credentials.email));
      
      // trata resposta HATEOAS (pode vir em _embedded ou direto)
      let userData = userResponse;
      if (userResponse && typeof userResponse === 'object' && !userResponse.id && userResponse._embedded) {
        // se veio em _embedded, extrai
        const embeddedKeys = Object.keys(userResponse._embedded);
        if (embeddedKeys.length > 0) {
          const embeddedData = userResponse._embedded[embeddedKeys[0]];
          userData = Array.isArray(embeddedData) ? embeddedData[0] : embeddedData;
        }
      }
      
      // remove _links se existir
      const { _links, ...cleanUserData } = userData || {};
      
      // api java usa displayName, não name
      const user: User = {
        id: cleanUserData.id,
        name: cleanUserData.displayName || cleanUserData.name || cleanUserData.email?.split('@')[0] || 'Usuário',
        email: cleanUserData.email,
        avatar: cleanUserData.avatar,
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

