export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  image: string;
  ingredients?: string;
  categories?: string[];
  nutriScore?: string | null;
  dataSource?: 'api' | 'open_food_facts' | 'cache';
  dataCompleteness?: 'complete' | 'partial';
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
    packagingType: 'reciclável' | 'biodegradável' | 'plástico' | 'vidro' | 'papel';
    sustainabilityScore: number;
    ecoScoreGrade?: string | null;
  };
  healthScore: number;
  sustainabilityScore: number;
  alternatives?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  productId: string;
  scannedAt: string;
  note?: string;
  product: Product | null;
}

export interface FavoriteEntry {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  note?: string;
  product: Product | null;
}
