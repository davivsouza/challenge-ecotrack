import { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Açaí Bowl Orgânico',
    brand: 'Natureza Verde',
    barcode: '7891234567890',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    nutritionalInfo: {
      calories: 320,
      protein: 8,
      carbs: 45,
      fat: 12,
      sugar: 25,
      sodium: 15,
      fiber: 8
    },
    environmentalImpact: {
      carbonFootprint: 0.8,
      waterUsage: 120,
      packagingType: 'biodegradável',
      sustainabilityScore: 85
    },
    healthScore: 78,
    sustainabilityScore: 85,
    alternatives: ['2', '3']
  },
  {
    id: '2',
    name: 'Smoothie de Frutas Vermelhas',
    brand: 'Vida Saudável',
    barcode: '7891234567891',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbs: 35,
      fat: 2,
      sugar: 28,
      sodium: 8,
      fiber: 6
    },
    environmentalImpact: {
      carbonFootprint: 0.5,
      waterUsage: 80,
      packagingType: 'reciclável',
      sustainabilityScore: 90
    },
    healthScore: 82,
    sustainabilityScore: 90,
    alternatives: ['1', '3']
  },
  {
    id: '3',
    name: 'Granola Artesanal',
    brand: 'Casa Natural',
    barcode: '7891234567892',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    nutritionalInfo: {
      calories: 450,
      protein: 12,
      carbs: 55,
      fat: 18,
      sugar: 15,
      sodium: 25,
      fiber: 10
    },
    environmentalImpact: {
      carbonFootprint: 1.2,
      waterUsage: 200,
      packagingType: 'papel',
      sustainabilityScore: 75
    },
    healthScore: 70,
    sustainabilityScore: 75,
    alternatives: ['1', '2']
  },
  {
    id: '4',
    name: 'Refrigerante Zero Açúcar',
    brand: 'Marca Popular',
    barcode: '7891234567893',
    image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 35,
      fiber: 0
    },
    environmentalImpact: {
      carbonFootprint: 2.5,
      waterUsage: 300,
      packagingType: 'plástico',
      sustainabilityScore: 25
    },
    healthScore: 30,
    sustainabilityScore: 25,
    alternatives: ['5', '6']
  },
  {
    id: '5',
    name: 'Água de Coco Natural',
    brand: 'Coco Verde',
    barcode: '7891234567894',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    nutritionalInfo: {
      calories: 45,
      protein: 1,
      carbs: 11,
      fat: 0,
      sugar: 8,
      sodium: 12,
      fiber: 0
    },
    environmentalImpact: {
      carbonFootprint: 0.3,
      waterUsage: 50,
      packagingType: 'biodegradável',
      sustainabilityScore: 95
    },
    healthScore: 88,
    sustainabilityScore: 95,
    alternatives: ['6']
  },
  {
    id: '6',
    name: 'Suco de Laranja Integral',
    brand: 'Frutas do Vale',
    barcode: '7891234567895',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
    nutritionalInfo: {
      calories: 110,
      protein: 2,
      carbs: 26,
      fat: 0,
      sugar: 22,
      sodium: 5,
      fiber: 1
    },
    environmentalImpact: {
      carbonFootprint: 0.7,
      waterUsage: 150,
      packagingType: 'vidro',
      sustainabilityScore: 80
    },
    healthScore: 75,
    sustainabilityScore: 80,
    alternatives: ['5']
  }
];

export const getUserByCredentials = (email: string, password: string) => {
  // autenticação mockada
  if (email === 'usuario@ecotrack.com' && password === '123456') {
    return {
      id: '1',
      name: 'João Silva',
      email: 'usuario@ecotrack.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    };
  }
  return null;
};

export const getProductByBarcode = (barcode: string): Product | null => {
  return mockProducts.find(product => product.barcode === barcode) || null;
};
