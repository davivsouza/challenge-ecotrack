import { db, type ProductRecord } from '../data/db.js';

const offBaseUrl = process.env.OPEN_FOOD_FACTS_URL || 'https://world.openfoodfacts.org/api/v2';

function computeHealthScore(product: Partial<ProductRecord>) {
  const n = product.nutritionalInfo;
  if (!n) return 50;
  return Math.max(0, Math.min(100, Math.round(100 - n.sugar * 1.2 - n.sodium * 0.08 + n.fiber * 4 + n.protein * 2)));
}

function computeSustainabilityScore(product: Partial<ProductRecord>) {
  const e = product.environmentalImpact;
  if (!e) return 50;
  return Math.max(0, Math.min(100, Math.round(100 - e.carbonFootprint * 18 - e.waterUsage * 0.08 + e.sustainabilityScore * 0.3)));
}

async function fetchOpenFoodFactsProduct(barcode: string): Promise<ProductRecord | null> {
  const response = await fetch(`${offBaseUrl}/product/${barcode}.json`);
  if (!response.ok) return null;
  const payload = await response.json() as any;
  const product = payload.product;
  if (!product) return null;

  const normalized: ProductRecord = {
    id: `off-${barcode}`,
    name: product.product_name_pt || product.product_name || 'Produto sem nome',
    brand: product.brands || 'Marca não informada',
    barcode,
    image: product.image_front_url || product.image_url || `https://via.placeholder.com/600?text=${encodeURIComponent(product.product_name || 'Produto')}`,
    ingredients: product.ingredients_text,
    categories: typeof product.categories === 'string' ? product.categories.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
    nutriScore: product.nutriscore_grade || null,
    nutritionalInfo: {
      calories: Number(product.nutriments?.['energy-kcal_100g'] ?? 0),
      protein: Number(product.nutriments?.proteins_100g ?? 0),
      carbs: Number(product.nutriments?.carbohydrates_100g ?? 0),
      fat: Number(product.nutriments?.fat_100g ?? 0),
      sugar: Number(product.nutriments?.sugars_100g ?? 0),
      sodium: Number(product.nutriments?.sodium_100g ?? 0) * 1000,
      fiber: Number(product.nutriments?.fiber_100g ?? 0),
    },
    environmentalImpact: {
      carbonFootprint: Number(product.ecoscore_data?.agribalyse?.co2_total ?? 2.5),
      waterUsage: Number(product.ecoscore_score ? 100 + (100 - Number(product.ecoscore_score)) * 4 : 240),
      packagingType: 'reciclável',
      sustainabilityScore: Number(product.ecoscore_score ?? 55),
      ecoScoreGrade: product.ecoscore_grade || null,
    },
    healthScore: 0,
    sustainabilityScore: 0,
    alternatives: db.products.slice(0, 2).map((item) => item.id),
    dataSource: 'open_food_facts',
    dataCompleteness: 'partial',
  };

  normalized.healthScore = computeHealthScore(normalized);
  normalized.sustainabilityScore = computeSustainabilityScore(normalized);
  return normalized;
}

export const productService = {
  async list(search?: string) {
    const normalized = search?.toLowerCase().trim();
    if (!normalized) return db.products;
    return db.products.filter((product) =>
      [product.name, product.brand, product.barcode, ...product.categories]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  },
  async findById(id: string) {
    return db.products.find((product) => product.id === id) || null;
  },
  async findByBarcode(barcode: string) {
    const localProduct = db.products.find((product) => product.barcode === barcode);
    if (localProduct) return localProduct;
    return fetchOpenFoodFactsProduct(barcode);
  },
};
