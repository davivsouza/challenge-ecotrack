import { API_CONFIG } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@ecotrack_token';
const USER_KEY = '@ecotrack_user';

// interface para resposta da api
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// classe para erros da api
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// função auxiliar para fazer requisições
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // verifica se a resposta está ok
    if (!response.ok) {
      let errorMessage = 'Erro ao processar requisição';
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      // se não autorizado, limpa o token
      if (response.status === 401) {
        await clearAuthData();
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // tenta parsear como json
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const jsonData = await response.json();
      
      // spring hateoas retorna paginado com _embedded quando é lista
      // estrutura: { _embedded: { products: [...] }, _links: {...}, page: {...} }
      if (jsonData._embedded && typeof jsonData._embedded === 'object') {
        const embeddedKeys = Object.keys(jsonData._embedded);
        if (embeddedKeys.length > 0) {
          // retorna array do primeiro _embedded
          const embeddedArray = jsonData._embedded[embeddedKeys[0]];
          if (Array.isArray(embeddedArray)) {
            return embeddedArray as T;
          }
          // se não é array, retorna o objeto
          return embeddedArray as T;
        }
      }
      
      // spring data retorna paginado com content
      // estrutura: { content: [...], page: {...}, totalElements: ... }
      if (Array.isArray(jsonData.content)) {
        return jsonData.content as T;
      }
      
      // retorna direto (objeto único com _links ou array direto)
      // remove _links se for objeto único para facilitar uso
      return jsonData as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Timeout na requisição. Tente novamente.');
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet.'
    );
  }
}

// funções auxiliares para métodos http
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

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

