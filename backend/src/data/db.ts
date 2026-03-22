export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  image: string;
  ingredients?: string;
  categories: string[];
  nutriScore?: string | null;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    sodium: number;
    fiber: number;
  };
  environmentalImpact: {
    carbonFootprint: number;
    waterUsage: number;
    packagingType: "reciclável" | "biodegradável" | "plástico" | "vidro" | "papel";
    sustainabilityScore: number;
    ecoScoreGrade?: string | null;
  };
  healthScore: number;
  sustainabilityScore: number;
  alternatives?: string[];
  dataSource?: "api" | "open_food_facts";
  dataCompleteness?: "complete" | "partial";
}

export interface HistoryRecord {
  id: string;
  userId: string;
  productId: string;
  scannedAt: string;
  note?: string;
}

export interface FavoriteRecord {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  note?: string;
}

export const db: {
  users: UserRecord[];
  products: ProductRecord[];
  history: HistoryRecord[];
  favorites: FavoriteRecord[];
} = {
  users: [
    {
      id: 'user-1',
      name: 'EcoTrack Demo',
      email: 'demo@ecotrack.com',
      password: '123456',
      createdAt: new Date().toISOString(),
    },
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Granola Integral Orgânica',
      brand: 'Verde Vida',
      barcode: '7891234567890',
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
      ingredients: 'Aveia, mel, castanhas, chia e uvas-passas.',
      categories: ['Café da manhã', 'Orgânico'],
      nutriScore: 'b',
      nutritionalInfo: { calories: 389, protein: 11, carbs: 57, fat: 12, sugar: 14, sodium: 90, fiber: 8 },
      environmentalImpact: { carbonFootprint: 1.8, waterUsage: 320, packagingType: 'papel', sustainabilityScore: 84, ecoScoreGrade: 'b' },
      healthScore: 82,
      sustainabilityScore: 84,
      alternatives: ['prod-3'],
      dataSource: 'api',
      dataCompleteness: 'complete',
    },
    {
      id: 'prod-2',
      name: 'Refrigerante Zero Açúcar',
      brand: 'FizzUp',
      barcode: '7891234567893',
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80',
      ingredients: 'Água gaseificada, aromatizantes e edulcorantes.',
      categories: ['Bebidas'],
      nutriScore: 'd',
      nutritionalInfo: { calories: 2, protein: 0, carbs: 1, fat: 0, sugar: 0, sodium: 32, fiber: 0 },
      environmentalImpact: { carbonFootprint: 3.2, waterUsage: 220, packagingType: 'plástico', sustainabilityScore: 38, ecoScoreGrade: 'd' },
      healthScore: 48,
      sustainabilityScore: 38,
      alternatives: ['prod-4'],
      dataSource: 'api',
      dataCompleteness: 'complete',
    },
    {
      id: 'prod-3',
      name: 'Mix de Nuts sem Açúcar',
      brand: 'Nature Fit',
      barcode: '7891234567892',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
      ingredients: 'Castanha-do-pará, amêndoas, nozes e sementes.',
      categories: ['Snacks', 'Saudável'],
      nutriScore: 'a',
      nutritionalInfo: { calories: 290, protein: 9, carbs: 13, fat: 22, sugar: 2, sodium: 18, fiber: 5 },
      environmentalImpact: { carbonFootprint: 1.4, waterUsage: 180, packagingType: 'reciclável', sustainabilityScore: 88, ecoScoreGrade: 'a' },
      healthScore: 90,
      sustainabilityScore: 88,
      alternatives: ['prod-1'],
      dataSource: 'api',
      dataCompleteness: 'complete',
    },
    {
      id: 'prod-4',
      name: 'Água de Coco Natural',
      brand: 'TropiFresh',
      barcode: '7891234567894',
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=80',
      ingredients: 'Água de coco integral.',
      categories: ['Bebidas', 'Natural'],
      nutriScore: 'a',
      nutritionalInfo: { calories: 21, protein: 0, carbs: 5, fat: 0, sugar: 4, sodium: 45, fiber: 0 },
      environmentalImpact: { carbonFootprint: 1.1, waterUsage: 140, packagingType: 'vidro', sustainabilityScore: 80, ecoScoreGrade: 'b' },
      healthScore: 85,
      sustainabilityScore: 80,
      alternatives: ['prod-2'],
      dataSource: 'api',
      dataCompleteness: 'complete',
    }
  ],
  history: [],
  favorites: [],
};
