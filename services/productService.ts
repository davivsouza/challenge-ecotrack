import { api, ApiError } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { Product } from '@/types';

// serviço de produtos
export const productService = {
  // busca produto por código de barras
  async getProductByBarcode(barcode: string): Promise<Product> {
    try {
      const response = await api.get<any>(
        API_ENDPOINTS.PRODUCT_BY_BARCODE(barcode)
      );
      
      // remove _links do HATEOAS
      const { _links, ...productData } = response as any;
      
      // busca impacto ambiental e nutrição separadamente
      const [impact, nutrition] = await Promise.all([
        this.getProductImpact(productData.id).catch(() => null),
        this.getProductNutrition(productData.id).catch(() => []),
      ]);
      
      // transforma para o formato esperado pelo mobile
      return this.transformProductResponse(productData, impact, nutrition);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error('Produto não encontrado');
      }
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Erro ao buscar produto');
      }
      throw new Error('Erro de conexão. Tente novamente.');
    }
  },

  // busca produto por id
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get<any>(
        API_ENDPOINTS.PRODUCT_BY_ID(id)
      );
      
      // remove _links do HATEOAS
      const { _links, ...productData } = response as any;
      
      // busca impacto ambiental e nutrição separadamente
      const [impact, nutrition] = await Promise.all([
        this.getProductImpact(id).catch(() => null),
        this.getProductNutrition(id).catch(() => []),
      ]);
      
      // transforma para o formato esperado pelo mobile
      return this.transformProductResponse(productData, impact, nutrition);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error('Produto não encontrado');
      }
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Erro ao buscar produto');
      }
      throw new Error('Erro de conexão. Tente novamente.');
    }
  },

  // lista todos os produtos (com paginação)
  async getAllProducts(page: number = 0, size: number = 20): Promise<Product[]> {
    try {
      const response = await api.get<any[]>(
        `${API_ENDPOINTS.PRODUCTS}?page=${page}&size=${size}`
      );
      
      // transforma cada produto buscando impacto e nutrição
      const products = await Promise.all(
        response.map(async (productData: any) => {
          const { _links, ...prod } = productData;
          const [impact, nutrition] = await Promise.all([
            this.getProductImpact(prod.id).catch(() => null),
            this.getProductNutrition(prod.id).catch(() => []),
          ]);
          return this.transformProductResponse(prod, impact, nutrition);
        })
      );
      
      return products;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Erro ao listar produtos');
      }
      throw new Error('Erro de conexão. Tente novamente.');
    }
  },

  // busca produtos alternativos
  async getAlternativeProducts(productId: string): Promise<Product[]> {
    try {
      const product = await this.getProductById(productId);
      if (!product.alternatives || product.alternatives.length === 0) {
        return [];
      }

      // busca todos os produtos alternativos
      const alternatives = await Promise.all(
        product.alternatives.map((altId) => this.getProductById(altId))
      );

      return alternatives;
    } catch (error) {
      console.error('Erro ao buscar alternativas:', error);
      return [];
    }
  },

  // busca impacto ambiental do produto
  async getProductImpact(productId: string): Promise<any> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.IMPACT_BY_PRODUCT(productId));
      const { _links, ...impact } = response as any;
      return impact;
    } catch (error) {
      return null;
    }
  },

  // busca informações nutricionais do produto
  async getProductNutrition(productId: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.NUTRITION_BY_PRODUCT(productId));
      return Array.isArray(response) ? response.map((item: any) => {
        const { _links, ...nutri } = item;
        return nutri;
      }) : [];
    } catch (error) {
      return [];
    }
  },

  // transforma resposta da API Java para formato do mobile
  transformProductResponse(
    productData: any,
    impact: any,
    nutrition: any[]
  ): Product {
    // mapeia nutrição para objeto estruturado
    const nutritionalInfo = nutrition.reduce((acc: any, nutri: any) => {
      const key = nutri.nutriKey?.toLowerCase() || '';
      const value = parseFloat(nutri.nutriValue) || 0;
      
      if (key.includes('calor')) acc.calories = value;
      else if (key.includes('prote')) acc.protein = value;
      else if (key.includes('carb') || key.includes('hidrat')) acc.carbs = value;
      else if (key.includes('gordura') || key.includes('lipid')) acc.fat = value;
      else if (key.includes('açúcar') || key.includes('sugar')) acc.sugar = value;
      else if (key.includes('sódio') || key.includes('sodium')) acc.sodium = value;
      else if (key.includes('fibra') || key.includes('fiber')) acc.fiber = value;
      
      return acc;
    }, {
      calories: productData.kcal100g || 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      fiber: 0,
    });

    // mapeia impacto ambiental
    const environmentalImpact = {
      carbonFootprint: impact?.co2PerUnit || productData.co2PerUnit || 0,
      waterUsage: impact?.waterL || 0,
      packagingType: impact?.origin || 'plástico' as const,
      sustainabilityScore: this.calculateSustainabilityScore(impact, productData),
    };

    return {
      id: productData.id,
      name: productData.name || '',
      brand: productData.category || '',
      barcode: productData.barcode || '',
      image: `https://via.placeholder.com/400?text=${encodeURIComponent(productData.name || 'Produto')}`,
      nutritionalInfo,
      environmentalImpact,
      healthScore: this.calculateHealthScore(nutritionalInfo),
      sustainabilityScore: environmentalImpact.sustainabilityScore,
      alternatives: [],
    };
  },

  // calcula score de sustentabilidade (0-100)
  calculateSustainabilityScore(impact: any, productData: any): number {
    let score = 50; // base
    
    // reduz score baseado em CO2
    const co2 = impact?.co2PerUnit || productData.co2PerUnit || 0;
    if (co2 > 2) score -= 30;
    else if (co2 > 1) score -= 15;
    else if (co2 < 0.5) score += 20;
    
    // reduz score baseado em uso de água
    const water = impact?.waterL || 0;
    if (water > 300) score -= 20;
    else if (water > 200) score -= 10;
    else if (water < 100) score += 15;
    
    // ajusta por origem/embalagem
    const origin = impact?.origin || '';
    if (origin.includes('recic') || origin.includes('biodegrad')) score += 15;
    
    return Math.max(0, Math.min(100, score));
  },

  // calcula score de saúde (0-100)
  calculateHealthScore(nutritionalInfo: any): number {
    let score = 50; // base
    
    // reduz por calorias excessivas
    if (nutritionalInfo.calories > 400) score -= 20;
    else if (nutritionalInfo.calories > 300) score -= 10;
    else if (nutritionalInfo.calories < 100) score += 10;
    
    // reduz por açúcar excessivo
    if (nutritionalInfo.sugar > 30) score -= 25;
    else if (nutritionalInfo.sugar > 20) score -= 15;
    else if (nutritionalInfo.sugar < 10) score += 10;
    
    // reduz por sódio excessivo
    if (nutritionalInfo.sodium > 500) score -= 20;
    else if (nutritionalInfo.sodium > 300) score -= 10;
    
    // aumenta por proteína
    if (nutritionalInfo.protein > 15) score += 15;
    else if (nutritionalInfo.protein > 10) score += 10;
    
    // aumenta por fibras
    if (nutritionalInfo.fiber > 8) score += 10;
    else if (nutritionalInfo.fiber > 5) score += 5;
    
    return Math.max(0, Math.min(100, score));
  },
};

