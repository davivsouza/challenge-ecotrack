export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  image: string;
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
    carbonFootprint: number; // kg CO2
    waterUsage: number; // litros
    packagingType: 'reciclável' | 'biodegradável' | 'plástico' | 'vidro' | 'papel';
    sustainabilityScore: number; // 0-100
  };
  healthScore: number; // 0-100
  sustainabilityScore: number; // 0-100
  alternatives?: string[]; // IDs de produtos alternativos
}

export interface ScanHistory {
  id: string;
  productId: string;
  scannedAt: Date;
  product: Product;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
