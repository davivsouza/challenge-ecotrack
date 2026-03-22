import { api } from '@/services/api';
import { Product } from '@/types';

export const productService = {
  async list(search?: string) {
    const { data } = await api.get<Product[]>('/products', { params: search ? { search } : undefined });
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
  async getByBarcode(barcode: string) {
    const { data } = await api.get<Product>(`/products/barcode/${barcode}`);
    return data;
  },
};
