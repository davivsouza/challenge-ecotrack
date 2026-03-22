import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import {
  API_ENDPOINTS,
  EXTERNAL_API_CONFIG,
  EXTERNAL_API_ENDPOINTS,
} from "@/config/api";
import { api } from "@/services/api";
import { Product } from "@/types";

type PackagingType = Product["environmentalImpact"]["packagingType"];

interface ApiProductResponse {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  barcode?: string;
  kcal100g?: number | string;
  co2PerUnit?: number | string;
}

interface ApiImpactResponse {
  co2PerUnit?: number | string;
  waterL?: number | string;
  origin?: string;
}

interface ApiNutritionResponse {
  nutriKey?: string;
  nutriValue?: string | number;
}

interface OpenFoodFactsPackagingDetails {
  score?: number | string;
}

interface OpenFoodFactsAgribalyse {
  co2_total?: number | string;
  score?: number | string;
  name_en?: string;
  name_fr?: string;
}

interface OpenFoodFactsPackagingItem {
  material?: string;
  shape?: string;
  number_of_units?: number;
}

interface OpenFoodFactsEcoscoreData {
  agribalyse?: OpenFoodFactsAgribalyse;
  adjustments?: {
    packaging?: OpenFoodFactsPackagingDetails;
  };
  grade?: string;
  missing_data_warning?: number;
}

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  product_name_pt?: string;
  generic_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  categories?: string;
  categories_tags?: string[];
  nutriments?: Record<string, number | string | undefined>;
  nutriscore_grade?: string;
  ecoscore_score?: number | string;
  ecoscore_grade?: string;
  ecoscore_data?: OpenFoodFactsEcoscoreData;
  packaging?: string;
  packaging_tags?: string[];
  packaging_text?: string;
  packaging_materials_tags?: string[];
  packaging_shapes_tags?: string[];
  packagings?: OpenFoodFactsPackagingItem[];
  data_quality_warnings_tags?: string[];
  data_quality_info_tags?: string[];
}

interface OpenFoodFactsResponse {
  status?: number;
  product?: OpenFoodFactsProduct;
}

const PRODUCT_CACHE_PREFIX = "@ecotrack_product_cache:";
const productMemoryCache = new Map<string, Product>();
const PRODUCT_LOG_PREFIX = "[EcoTrack][ProductService]";
const OPEN_FOOD_FACTS_FIELDS = [
  "code",
  "product_name",
  "product_name_pt",
  "generic_name",
  "brands",
  "image_url",
  "image_front_url",
  "ingredients_text",
  "categories",
  "categories_tags",
  "nutriments",
  "nutriscore_grade",
  "ecoscore_score",
  "ecoscore_grade",
  "ecoscore_data",
  "packaging",
  "packaging_tags",
  "packaging_text",
  "packaging_materials_tags",
  "packaging_shapes_tags",
  "packagings",
  "data_quality_warnings_tags",
  "data_quality_info_tags",
];

function sanitizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, "");
}

function isValidBarcode(barcode: string): boolean {
  return /^\d{8,14}$/.test(barcode);
}

function parseNumber(value: number | string | undefined | null): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function roundValue(value: number, precision: number = 1): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildPlaceholderImage(name: string): string {
  return `https://via.placeholder.com/400?text=${encodeURIComponent(name || "Produto")}`;
}

function parseCategories(categories?: string): string[] {
  if (!categories) {
    return [];
  }

  return categories
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatOpenFoodFactsLabel(value?: string): string {
  if (!value) {
    return "";
  }

  const withoutPrefix = value.replace(/^[a-z]{2}:/i, "");
  const withSpaces = withoutPrefix.replace(/[-_]/g, " ").trim();

  if (!withSpaces) {
    return "";
  }

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function parseUniqueLabels(values?: string[]): string[] {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(
      values.map((value) => formatOpenFoodFactsLabel(value)).filter(Boolean),
    ),
  );
}

function extractPackagingComponents(
  packagings?: OpenFoodFactsPackagingItem[],
): string[] {
  if (!packagings) {
    return [];
  }

  return packagings
    .map((item) => {
      const material = formatOpenFoodFactsLabel(item.material);
      const shape = formatOpenFoodFactsLabel(item.shape);

      if (material && shape) {
        return `${material} (${shape})`;
      }

      return material || shape;
    })
    .filter(Boolean);
}

function inferPackagingType(input?: string | string[]): PackagingType {
  const text = Array.isArray(input) ? input.join(" ") : input || "";
  const normalized = text.toLowerCase();

  if (
    normalized.includes("glass") ||
    normalized.includes("vidro") ||
    normalized.includes("bottle")
  ) {
    return "vidro";
  }

  if (
    normalized.includes("paper") ||
    normalized.includes("cardboard") ||
    normalized.includes("papel")
  ) {
    return "papel";
  }

  if (
    normalized.includes("bio") ||
    normalized.includes("compost") ||
    normalized.includes("biodegrad")
  ) {
    return "biodegradável";
  }

  if (
    normalized.includes("recycl") ||
    normalized.includes("recicl") ||
    normalized.includes("aluminium") ||
    normalized.includes("metal")
  ) {
    return "reciclável";
  }

  return "plástico";
}

function mapNutriScoreToValue(nutriScore?: string | null): number | null {
  switch ((nutriScore || "").toUpperCase()) {
    case "A":
      return 95;
    case "B":
      return 80;
    case "C":
      return 60;
    case "D":
      return 35;
    case "E":
      return 15;
    default:
      return null;
  }
}

function logProductTrace(message: string, data?: Record<string, unknown>) {
  if (data) {
    console.log(PRODUCT_LOG_PREFIX, message, data);
    return;
  }

  console.log(PRODUCT_LOG_PREFIX, message);
}

// serviço de produtos
export const productService = {
  // busca produto por código de barras
  async getProductByBarcode(barcode: string): Promise<Product> {
    const normalizedBarcode = sanitizeBarcode(barcode);
    logProductTrace("Iniciando busca por código de barras", {
      barcode,
      normalizedBarcode,
    });

    if (!isValidBarcode(normalizedBarcode)) {
      logProductTrace("Código de barras inválido", {
        normalizedBarcode,
      });
      throw new Error("Digite um código de barras válido com 8 a 14 dígitos");
    }

    const cachedProduct = await this.getCachedProduct(normalizedBarcode);
    if (cachedProduct) {
      logProductTrace("Produto encontrado imediatamente no cache", {
        productId: cachedProduct.id,
        barcode: normalizedBarcode,
      });
      return cachedProduct;
    }

    try {
      logProductTrace("Tentando Open Food Facts por barcode", {
        barcode: normalizedBarcode,
      });
      const openFoodFactsProduct =
        await this.fetchProductFromOpenFoodFacts(normalizedBarcode);
      await this.cacheProduct(openFoodFactsProduct);
      logProductTrace("Produto encontrado no Open Food Facts", {
        productId: openFoodFactsProduct.id,
        dataSource: openFoodFactsProduct.dataSource,
      });
      return openFoodFactsProduct;
    } catch (openFoodFactsError: unknown) {
      logProductTrace("Falha no Open Food Facts por barcode", {
        barcode: normalizedBarcode,
        error: this.getErrorMessage(openFoodFactsError, "Erro desconhecido"),
      });

      try {
        logProductTrace("Tentando API principal por barcode como fallback", {
          barcode: normalizedBarcode,
        });
        const apiProduct =
          await this.fetchProductFromApiByBarcode(normalizedBarcode);
        await this.cacheProduct(apiProduct);
        logProductTrace("Produto encontrado na API principal", {
          productId: apiProduct.id,
          dataSource: apiProduct.dataSource,
        });
        return apiProduct;
      } catch (apiError: unknown) {
        logProductTrace("Falha na API principal por barcode", {
          barcode: normalizedBarcode,
          error: this.getErrorMessage(apiError, "Erro desconhecido"),
        });
        if (
          this.isNotFoundError(apiError) ||
          this.isNotFoundError(openFoodFactsError)
        ) {
          throw new Error("Produto não encontrado");
        }

        throw new Error(
          this.getErrorMessage(openFoodFactsError, "Erro ao buscar produto"),
        );
      }
    }
  },

  // busca produto por id
  async getProductById(id: string): Promise<Product> {
    const normalizedId = id.trim();
    logProductTrace("Iniciando busca por id", {
      id,
      normalizedId,
    });
    const cachedProduct = await this.getCachedProduct(normalizedId);

    if (cachedProduct) {
      logProductTrace("Produto encontrado no cache por id", {
        productId: cachedProduct.id,
        normalizedId,
      });
      return cachedProduct;
    }

    try {
      logProductTrace("Tentando API principal por id", {
        id: normalizedId,
      });
      const apiProduct = await this.fetchProductFromApiById(normalizedId);
      await this.cacheProduct(apiProduct);
      logProductTrace("Produto encontrado na API principal por id", {
        productId: apiProduct.id,
      });
      return apiProduct;
    } catch (apiError: unknown) {
      logProductTrace("Falha na API principal por id", {
        id: normalizedId,
        error: this.getErrorMessage(apiError, "Erro desconhecido"),
      });
      if (isValidBarcode(normalizedId)) {
        try {
          logProductTrace("Tentando Open Food Facts usando id como barcode", {
            id: normalizedId,
          });
          const openFoodFactsProduct =
            await this.fetchProductFromOpenFoodFacts(normalizedId);
          await this.cacheProduct(openFoodFactsProduct);
          logProductTrace(
            "Produto encontrado no Open Food Facts por id/barcode",
            {
              productId: openFoodFactsProduct.id,
            },
          );
          return openFoodFactsProduct;
        } catch (openFoodFactsError: unknown) {
          logProductTrace("Falha no Open Food Facts por id/barcode", {
            id: normalizedId,
            error: this.getErrorMessage(
              openFoodFactsError,
              "Erro desconhecido",
            ),
          });
          if (
            this.isNotFoundError(apiError) ||
            this.isNotFoundError(openFoodFactsError)
          ) {
            throw new Error("Produto não encontrado");
          }

          throw new Error(
            this.getErrorMessage(openFoodFactsError, "Erro ao buscar produto"),
          );
        }
      }

      if (this.isNotFoundError(apiError)) {
        throw new Error("Produto não encontrado");
      }

      throw new Error(this.getErrorMessage(apiError, "Erro ao buscar produto"));
    }
  },

  // lista todos os produtos (com paginação)
  async getAllProducts(
    page: number = 0,
    size: number = 20,
  ): Promise<Product[]> {
    try {
      const response = await api.get<
        | ApiProductResponse[]
        | {
            _embedded?: { productList?: ApiProductResponse[] };
            content?: ApiProductResponse[];
          }
      >(`${API_ENDPOINTS.PRODUCTS}?page=${page}&size=${size}`);
      const data = response.data;

      let productsArray: ApiProductResponse[] = [];
      if (!Array.isArray(data) && data._embedded?.productList) {
        productsArray = data._embedded.productList;
      } else if (Array.isArray(data)) {
        productsArray = data;
      } else if (!Array.isArray(data) && data.content) {
        productsArray = data.content;
      }

      const products = productsArray.map((productData) => {
        const { _links, ...prod } = productData as ApiProductResponse & {
          _links?: unknown;
        };
        return this.transformApiProductResponse(prod, null, []);
      });

      await Promise.all(products.map((product) => this.cacheProduct(product)));
      return products;
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error, "Erro ao listar produtos"));
    }
  },

  // busca produtos alternativos
  // deprecado: usar busca direta por ID para evitar loops
  async getAlternativeProducts(productId: string): Promise<Product[]> {
    try {
      const product = await this.getProductById(productId);
      if (!product.alternatives || product.alternatives.length === 0) {
        return [];
      }

      const limitedAlternatives = product.alternatives.slice(0, 5);
      const alternatives = await Promise.all(
        limitedAlternatives.map((altId) =>
          this.getProductById(altId).catch(() => null),
        ),
      );

      return alternatives.filter(
        (productItem): productItem is Product => productItem !== null,
      );
    } catch (error) {
      console.error("Erro ao buscar alternativas:", error);
      return [];
    }
  },

  // busca impacto ambiental do produto
  async getProductImpact(productId: string): Promise<ApiImpactResponse | null> {
    try {
      const response = await api.get<ApiImpactResponse>(
        API_ENDPOINTS.IMPACT_BY_PRODUCT(productId),
      );
      const { _links, ...impact } = (response.data ||
        {}) as ApiImpactResponse & { _links?: unknown };
      return impact;
    } catch (error) {
      return null;
    }
  },

  // busca informações nutricionais do produto
  async getProductNutrition(
    productId: string,
  ): Promise<ApiNutritionResponse[]> {
    try {
      const response = await api.get<ApiNutritionResponse[]>(
        API_ENDPOINTS.NUTRITION_BY_PRODUCT(productId),
      );
      const data = response.data;
      const nutritionArray = Array.isArray(data) ? data : [];

      return nutritionArray.map((item) => {
        const { _links, ...nutri } = item as ApiNutritionResponse & {
          _links?: unknown;
        };
        return nutri;
      });
    } catch (error) {
      return [];
    }
  },

  async fetchProductFromApiByBarcode(barcode: string): Promise<Product> {
    logProductTrace("Chamando endpoint da API principal por barcode", {
      endpoint: API_ENDPOINTS.PRODUCT_BY_BARCODE(barcode),
    });
    const response = await api.get<ApiProductResponse>(
      API_ENDPOINTS.PRODUCT_BY_BARCODE(barcode),
    );
    const { _links, ...productData } = (response.data ||
      {}) as ApiProductResponse & { _links?: unknown };

    if (!productData.id) {
      throw new Error("Produto não encontrado");
    }

    const [impact, nutrition] = await Promise.all([
      this.getProductImpact(productData.id),
      this.getProductNutrition(productData.id),
    ]);

    return this.transformApiProductResponse(productData, impact, nutrition);
  },

  async fetchProductFromApiById(id: string): Promise<Product> {
    logProductTrace("Chamando endpoint da API principal por id", {
      endpoint: API_ENDPOINTS.PRODUCT_BY_ID(id),
    });
    const response = await api.get<ApiProductResponse>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
    );
    const { _links, ...productData } = (response.data ||
      {}) as ApiProductResponse & { _links?: unknown };

    if (!productData.id) {
      throw new Error("Produto não encontrado");
    }

    const [impact, nutrition] = await Promise.all([
      this.getProductImpact(productData.id),
      this.getProductNutrition(productData.id),
    ]);

    return this.transformApiProductResponse(productData, impact, nutrition);
  },

  async fetchProductFromOpenFoodFacts(barcode: string): Promise<Product> {
    logProductTrace("Chamando Open Food Facts", {
      endpoint:
        EXTERNAL_API_ENDPOINTS.OPEN_FOOD_FACTS_PRODUCT_BY_BARCODE(barcode),
      fields: OPEN_FOOD_FACTS_FIELDS.join(","),
    });
    const response = await axios.get<OpenFoodFactsResponse>(
      EXTERNAL_API_ENDPOINTS.OPEN_FOOD_FACTS_PRODUCT_BY_BARCODE(barcode),
      {
        params: {
          fields: OPEN_FOOD_FACTS_FIELDS.join(","),
        },
        timeout: EXTERNAL_API_CONFIG.TIMEOUT,
      },
    );

    if (response.data?.status !== 1 || !response.data.product?.code) {
      throw new Error("Produto não encontrado");
    }

    return this.transformOpenFoodFactsResponse(response.data.product);
  },

  async cacheProduct(product: Product): Promise<void> {
    const payload = JSON.stringify(product);
    const cacheKeys = new Set<string>();

    if (product.id) {
      cacheKeys.add(product.id);
    }

    const normalizedBarcode = sanitizeBarcode(product.barcode);
    if (normalizedBarcode) {
      cacheKeys.add(normalizedBarcode);
    }

    await Promise.all(
      Array.from(cacheKeys).map(async (key) => {
        productMemoryCache.set(key, product);
        await AsyncStorage.setItem(`${PRODUCT_CACHE_PREFIX}${key}`, payload);
      }),
    );
    logProductTrace("Produto salvo em cache", {
      productId: product.id,
      barcode: normalizedBarcode,
      cacheKeys: Array.from(cacheKeys),
    });
  },

  async getCachedProduct(productIdOrBarcode: string): Promise<Product | null> {
    const candidates = new Set<string>();
    const rawValue = productIdOrBarcode.trim();
    const sanitizedValue = sanitizeBarcode(rawValue);

    if (rawValue) {
      candidates.add(rawValue);
    }

    if (sanitizedValue) {
      candidates.add(sanitizedValue);
    }

    for (const candidate of candidates) {
      const memoryProduct = productMemoryCache.get(candidate);
      if (memoryProduct) {
        logProductTrace("Cache em memória utilizado", {
          candidate,
          productId: memoryProduct.id,
        });
        return {
          ...memoryProduct,
          dataSource: "cache",
        };
      }

      const storedProduct = await AsyncStorage.getItem(
        `${PRODUCT_CACHE_PREFIX}${candidate}`,
      );
      if (storedProduct) {
        const parsedProduct = JSON.parse(storedProduct) as Product;
        productMemoryCache.set(candidate, parsedProduct);
        logProductTrace("Cache persistido utilizado", {
          candidate,
          productId: parsedProduct.id,
        });
        return {
          ...parsedProduct,
          dataSource: "cache",
        };
      }
    }

    return null;
  },

  isNotFoundError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      return error.response?.status === 404;
    }

    return error instanceof Error && error.message === "Produto não encontrado";
  },

  getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | { message?: string }
        | undefined;
      return responseData?.message || fallbackMessage;
    }

    return error instanceof Error ? error.message : fallbackMessage;
  },

  transformApiProductResponse(
    productData: ApiProductResponse,
    impact: ApiImpactResponse | null,
    nutrition: ApiNutritionResponse[],
  ): Product {
    const nutritionalInfo = nutrition.reduce<Product["nutritionalInfo"]>(
      (acc, nutri) => {
        const key = nutri.nutriKey?.toLowerCase() || "";
        const value = parseNumber(nutri.nutriValue);

        if (key.includes("calor")) acc.calories = value;
        else if (key.includes("prote")) acc.protein = value;
        else if (key.includes("carb") || key.includes("hidrat"))
          acc.carbs = value;
        else if (key.includes("gordura") || key.includes("lipid"))
          acc.fat = value;
        else if (key.includes("açúcar") || key.includes("sugar"))
          acc.sugar = value;
        else if (key.includes("sódio") || key.includes("sodium"))
          acc.sodium = value;
        else if (key.includes("fibra") || key.includes("fiber"))
          acc.fiber = value;

        return acc;
      },
      {
        calories: parseNumber(productData.kcal100g),
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
        sodium: 0,
        fiber: 0,
      },
    );

    const environmentalImpact = {
      carbonFootprint: roundValue(
        parseNumber(impact?.co2PerUnit || productData.co2PerUnit),
        2,
      ),
      waterUsage: roundValue(parseNumber(impact?.waterL), 1),
      packagingType: inferPackagingType(impact?.origin),
      sustainabilityScore: this.calculateSustainabilityScore(
        impact,
        productData,
      ),
    };

    return {
      id: productData.id || "",
      name: productData.name || "Produto sem nome",
      brand: productData.brand || productData.category || "Marca não informada",
      barcode: productData.barcode || "",
      image: buildPlaceholderImage(productData.name || "Produto"),
      categories: productData.category ? [productData.category] : [],
      dataSource: "api",
      dataCompleteness: nutrition.length > 0 ? "complete" : "partial",
      nutritionalInfo,
      environmentalImpact,
      healthScore: this.calculateHealthScore(nutritionalInfo),
      sustainabilityScore: environmentalImpact.sustainabilityScore,
      alternatives: [],
    };
  },

  transformOpenFoodFactsResponse(productData: OpenFoodFactsProduct): Product {
    const nutriments = productData.nutriments || {};
    const sodiumInGrams =
      parseNumber(nutriments.sodium_100g) ||
      parseNumber(nutriments.salt_100g) * 0.393;
    const nutritionalInfo: Product["nutritionalInfo"] = {
      calories: roundValue(
        parseNumber(nutriments["energy-kcal_100g"]) ||
          parseNumber(nutriments["energy-kcal"]),
        0,
      ),
      protein: roundValue(parseNumber(nutriments.proteins_100g)),
      carbs: roundValue(parseNumber(nutriments.carbohydrates_100g)),
      fat: roundValue(parseNumber(nutriments.fat_100g)),
      sugar: roundValue(parseNumber(nutriments.sugars_100g)),
      sodium: roundValue(sodiumInGrams * 1000, 0),
      fiber: roundValue(parseNumber(nutriments.fiber_100g)),
    };
    const packagingType = inferPackagingType(
      productData.packaging_tags ||
        productData.packaging_text ||
        productData.packaging,
    );
    const carbonFootprint = roundValue(
      parseNumber(productData.ecoscore_data?.agribalyse?.co2_total),
      2,
    );
    const packagingScore = parseNumber(
      productData.ecoscore_data?.adjustments?.packaging?.score,
    );
    const sustainabilityScore = clampScore(
      parseNumber(productData.ecoscore_score) ||
        packagingScore ||
        this.calculateSustainabilityScore(
          {
            co2PerUnit: carbonFootprint,
            origin: packagingType,
          },
          {
            co2PerUnit: carbonFootprint,
          },
        ),
    );
    const nutriScore = productData.nutriscore_grade
      ? productData.nutriscore_grade.toUpperCase()
      : null;
    const derivedHealthScore = mapNutriScoreToValue(nutriScore);

    return {
      id: productData.code || "",
      name:
        productData.product_name ||
        productData.product_name_pt ||
        productData.generic_name ||
        "Produto sem nome",
      brand: productData.brands || "Marca não informada",
      barcode: productData.code || "",
      image:
        productData.image_front_url ||
        productData.image_url ||
        buildPlaceholderImage(productData.product_name || "Produto"),
      ingredients: productData.ingredients_text || "",
      categories: parseCategories(productData.categories),
      nutriScore,
      dataSource: "open_food_facts",
      dataCompleteness:
        Boolean(productData.image_front_url || productData.image_url) &&
        Boolean(productData.ingredients_text) &&
        Object.values(nutritionalInfo).some((value) => value > 0)
          ? "complete"
          : "partial",
      nutritionalInfo,
      environmentalImpact: {
        carbonFootprint,
        waterUsage: 0,
        packagingType,
        sustainabilityScore,
        ecoScoreGrade:
          (
            productData.ecoscore_grade ||
            productData.ecoscore_data?.grade ||
            null
          )?.toUpperCase?.() || null,
        packagingMaterials: parseUniqueLabels(
          productData.packaging_materials_tags,
        ),
        packagingComponents: extractPackagingComponents(productData.packagings),
        agribalyseScore: roundValue(
          parseNumber(productData.ecoscore_data?.agribalyse?.score),
          0,
        ),
        agribalyseReference:
          productData.ecoscore_data?.agribalyse?.name_en ||
          productData.ecoscore_data?.agribalyse?.name_fr ||
          "",
        warnings: [
          ...parseUniqueLabels(productData.data_quality_warnings_tags),
          ...parseUniqueLabels(productData.data_quality_info_tags).slice(0, 2),
        ].slice(0, 4),
        missingDataWarning: Boolean(
          productData.ecoscore_data?.missing_data_warning,
        ),
      },
      healthScore:
        derivedHealthScore ?? this.calculateHealthScore(nutritionalInfo),
      sustainabilityScore,
      alternatives: [],
    };
  },

  // calcula score de sustentabilidade (0-100)
  calculateSustainabilityScore(
    impact: Partial<ApiImpactResponse> | null,
    productData: Partial<ApiProductResponse>,
  ): number {
    let score = 50;

    const co2 = parseNumber(impact?.co2PerUnit || productData.co2PerUnit);
    if (co2 > 2) score -= 30;
    else if (co2 > 1) score -= 15;
    else if (co2 < 0.5) score += 20;

    const water = parseNumber(impact?.waterL);
    if (water > 300) score -= 20;
    else if (water > 200) score -= 10;
    else if (water < 100) score += 15;

    const origin = impact?.origin || "";
    if (origin.includes("recic") || origin.includes("biodegrad")) score += 15;

    return clampScore(score);
  },

  // calcula score de saúde (0-100)
  calculateHealthScore(nutritionalInfo: Product["nutritionalInfo"]): number {
    let score = 50;

    if (nutritionalInfo.calories > 400) score -= 20;
    else if (nutritionalInfo.calories > 300) score -= 10;
    else if (nutritionalInfo.calories < 100) score += 10;

    if (nutritionalInfo.sugar > 30) score -= 25;
    else if (nutritionalInfo.sugar > 20) score -= 15;
    else if (nutritionalInfo.sugar < 10) score += 10;

    if (nutritionalInfo.sodium > 500) score -= 20;
    else if (nutritionalInfo.sodium > 300) score -= 10;

    if (nutritionalInfo.protein > 15) score += 15;
    else if (nutritionalInfo.protein > 10) score += 10;

    if (nutritionalInfo.fiber > 8) score += 10;
    else if (nutritionalInfo.fiber > 5) score += 5;

    return clampScore(score);
  },
};
