// configuração da api java
export const API_CONFIG = {
  // altere para a url da sua api java
  // base url sem /api pois endpoints já incluem /api
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.28:8080/api",
  TIMEOUT: 4000,
};

export const EXTERNAL_API_CONFIG = {
  OPEN_FOOD_FACTS_BASE_URL:
    process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_URL ||
    "https://world.openfoodfacts.org/api/v2",
  TIMEOUT: 6000,
};

export const API_ENDPOINTS = {
  // usuários (usado para login e busca)
  USERS: "/users",
  USER_BY_EMAIL: (email: string) =>
    `/users/by-email?email=${encodeURIComponent(email)}`,
  USER_BY_ID: (id: string) => `/users/${id}`,

  // produtos
  PRODUCTS: "/products",
  PRODUCT_BY_BARCODE: (barcode: string) => `/products/barcode/${barcode}`,
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category: string) => `/products/category/${category}`,
  PRODUCTS_SEARCH: (query: string) =>
    `/products/search?q=${encodeURIComponent(query)}`,

  // escaneamento e histórico
  SCAN: "/scan",
  SCAN_HISTORY: (email: string) =>
    `/scan/history?email=${encodeURIComponent(email)}`,
  SCAN_FAVORITE: (productId: string, email: string) =>
    `/scan/favorite/${productId}?email=${encodeURIComponent(email)}`,
  SCAN_FAVORITES: (email: string) =>
    `/scan/favorites?email=${encodeURIComponent(email)}`,

  // impacto ambiental
  IMPACT: "/impact",
  IMPACT_BY_PRODUCT: (productId: string) => `/impact/${productId}`,

  // nutrição
  NUTRITION: "/nutrition",
  NUTRITION_BY_PRODUCT: (productId: string) => `/nutrition/${productId}`,
};

export const EXTERNAL_API_ENDPOINTS = {
  OPEN_FOOD_FACTS_PRODUCT_BY_BARCODE: (barcode: string) =>
    `${EXTERNAL_API_CONFIG.OPEN_FOOD_FACTS_BASE_URL}/product/${barcode}`,
};
