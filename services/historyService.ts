import { api, getAuthUser } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { ScanHistory, Product } from '@/types';
import { productService } from '@/services/productService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ecotrack_history';

// serviço de histórico
export const historyService = {
  // salva escaneamento na api (chamado automaticamente ao escanear)
  async saveScan(email: string, barcode: string): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.SCAN, {
        email,
        barcode,
      });
    } catch (error: any) {
      // não lança erro para não interromper o fluxo de escaneamento
      console.warn('Não foi possível salvar escaneamento na API:', error);
    }
  },

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
      const response = await api.get(API_ENDPOINTS.SCAN_HISTORY(email));
      const data = Array.isArray(response.data) ? response.data : [];
      
      // busca produtos completos para cada item do histórico
      const historyWithProducts = await Promise.all(
        data.map(async (item: any) => {
          const { _links, ...scanHistory } = item;
          
          // busca produto completo se tiver id
          let product: Product | null = null;
          if (item.product?.id) {
            try {
              product = await productService.getProductById(item.product.id);
            } catch (error) {
              console.warn(`Erro ao buscar produto ${item.product.id}:`, error);
              // usa dados básicos do produto se falhar
              product = null;
            }
          }
          
          // se não conseguiu buscar produto completo, usa dados básicos
          if (!product && item.product) {
            const basicProduct = item.product;
            product = {
              id: basicProduct.id || '',
              name: basicProduct.name || '',
              brand: basicProduct.category || '',
              barcode: basicProduct.barcode || '',
              image: `https://via.placeholder.com/400?text=${encodeURIComponent(basicProduct.name || 'Produto')}`,
              nutritionalInfo: {
                calories: basicProduct.kcal100g || 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                sugar: 0,
                sodium: 0,
                fiber: 0,
              },
              environmentalImpact: {
                carbonFootprint: basicProduct.co2PerUnit || 0,
                waterUsage: 0,
                packagingType: 'plástico',
                sustainabilityScore: 0,
              },
              healthScore: 0,
              sustainabilityScore: 0,
              alternatives: [],
            };
          }
          
          return {
            id: scanHistory.id || Date.now().toString(),
            productId: item.product?.id || '',
            scannedAt: new Date(item.scannedAt || new Date()),
            product: product || {
              id: '',
              name: 'Produto não encontrado',
              brand: '',
              barcode: '',
              image: '',
              nutritionalInfo: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                sugar: 0,
                sodium: 0,
                fiber: 0,
              },
              environmentalImpact: {
                carbonFootprint: 0,
                waterUsage: 0,
                packagingType: 'plástico',
                sustainabilityScore: 0,
              },
              healthScore: 0,
              sustainabilityScore: 0,
            },
          };
        })
      );
      
      return historyWithProducts;
    } catch (error: any) {
      if (error.response?.status === 404) {
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

