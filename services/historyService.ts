import { api, ApiError, getAuthUser } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { ScanHistory, Product } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ecotrack_history';

// serviço de histórico
export const historyService = {
  // adiciona produto ao histórico (local e api)
  async addToHistory(product: Product): Promise<void> {
    try {
      // salva localmente
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      
      const newItem: ScanHistory = {
        id: Date.now().toString(),
        productId: product.id,
        scannedAt: new Date(),
        product,
      };

      const updatedHistory = [newItem, ...history];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

      // tenta salvar na api também (endpoint /api/scan)
      try {
        const user = await getAuthUser();
        if (user?.email) {
          await api.post(API_ENDPOINTS.SCAN, {
            email: user.email,
            barcode: product.barcode,
          });
        }
      } catch (apiError) {
        // se falhar na api, continua com armazenamento local
        console.warn('Não foi possível salvar na API, usando armazenamento local');
      }
    } catch (error) {
      throw new Error('Erro ao salvar no histórico');
    }
  },

  // busca histórico local
  async getLocalHistory(): Promise<ScanHistory[]> {
    try {
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      if (!storedHistory) {
        return [];
      }

      const history = JSON.parse(storedHistory);
      return history.map((item: any) => ({
        ...item,
        scannedAt: new Date(item.scannedAt),
      }));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  },

  // busca histórico da api (/api/scan/history?email={email})
  async getApiHistory(email: string): Promise<ScanHistory[]> {
    try {
      const response = await api.get<ScanHistory[]>(
        API_ENDPOINTS.SCAN_HISTORY(email)
      );
      return response.map((item: any) => {
        const { _links, ...scanHistory } = item;
        return {
          ...scanHistory,
          scannedAt: new Date(item.scannedAt || item.scannedAt || new Date()),
          product: item.product || {},
        };
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // limpa histórico (só local, api não tem endpoint de limpeza)
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      throw new Error('Erro ao limpar histórico');
    }
  },
};

