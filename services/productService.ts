import { api } from '@/services/api';
import { Product } from '@/types';

type RawProduct = Partial<Product> & {
  environmentalImpact?: Partial<Product['environmentalImpact']>;
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const tryParseNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const parseNumber = (value: unknown, fallback = 0) => {
  const parsed = tryParseNumber(value);
  return parsed === null ? fallback : parsed;
};

const parseNullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  return tryParseNumber(value);
};

const normalizeDataSource = (value: Product['dataSource'] | string | undefined): Product['dataSource'] => {
  if (value === 'open_food_facts' || value === 'open-food-facts') return 'open-food-facts';
  if (value === 'cache') return 'cache';
  return 'api';
};

const normalizeImpactLevel = (
  value: Product['environmentalImpact']['environmentalImpactLevel'] | string | null | undefined,
  sustainabilityScore: number,
): Product['environmentalImpact']['environmentalImpactLevel'] => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (normalized === 'BAIXO' || normalized === 'MEDIO' || normalized === 'ALTO' || normalized === 'DESCONHECIDO') {
    return normalized;
  }

  if (sustainabilityScore <= 0) return 'DESCONHECIDO';
  if (sustainabilityScore >= 70) return 'BAIXO';
  if (sustainabilityScore >= 40) return 'MEDIO';
  return 'ALTO';
};

const normalizeProduct = (raw: RawProduct): Product => {
  const sustainabilityScore = clampScore(
    parseNumber(raw.sustainabilityScore ?? raw.environmentalImpact?.sustainabilityScore ?? 0, 0),
  );

  return {
    id: raw.id ?? '',
    name: raw.name ?? 'Produto sem nome',
    brand: raw.brand ?? 'Marca não informada',
    barcode: raw.barcode ?? '',
    image: raw.image ?? '',
    ingredients: raw.ingredients,
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    nutriScore: raw.nutriScore ?? null,
    dataSource: normalizeDataSource(raw.dataSource),
    dataCompleteness:
      typeof raw.dataCompleteness === 'number' || raw.dataCompleteness === 'complete' || raw.dataCompleteness === 'partial'
        ? raw.dataCompleteness
        : undefined,
    nutritionalInfo: {
      calories: parseNumber(raw.nutritionalInfo?.calories, 0),
      protein: parseNumber(raw.nutritionalInfo?.protein, 0),
      carbs: parseNumber(raw.nutritionalInfo?.carbs, 0),
      fat: parseNumber(raw.nutritionalInfo?.fat, 0),
      sugar: parseNumber(raw.nutritionalInfo?.sugar, 0),
      sodium: parseNumber(raw.nutritionalInfo?.sodium, 0),
      fiber: parseNumber(raw.nutritionalInfo?.fiber, 0),
    },
    environmentalImpact: {
      carbonFootprint: parseNullableNumber(raw.environmentalImpact?.carbonFootprint),
      waterUsage: parseNullableNumber(raw.environmentalImpact?.waterUsage),
      packagingType: raw.environmentalImpact?.packagingType?.trim() || 'não informado',
      sustainabilityScore,
      ecoScoreGrade: raw.environmentalImpact?.ecoScoreGrade ?? null,
      environmentalImpactLevel: normalizeImpactLevel(
        raw.environmentalImpact?.environmentalImpactLevel,
        sustainabilityScore,
      ),
    },
    healthScore: clampScore(parseNumber(raw.healthScore, 0)),
    sustainabilityScore,
    alternatives: Array.isArray(raw.alternatives) ? raw.alternatives : [],
  };
};

export const productService = {
  async list(search?: string) {
    const { data } = await api.get<RawProduct[]>('/products', { params: search ? { search } : undefined });
    return data.map(normalizeProduct);
  },
  async getById(id: string) {
    const { data } = await api.get<RawProduct>(`/products/${id}`);
    return normalizeProduct(data);
  },
  async getByBarcode(barcode: string) {
    const { data } = await api.get<RawProduct>(`/products/barcode/${barcode}`);
    return normalizeProduct(data);
  },
};
