import { api } from '@/services/api';
import { FavoriteEntry } from '@/types';

export const favoriteService = {
  async list() {
    const { data } = await api.get<FavoriteEntry[]>('/favorites');
    return data;
  },
  async create(productId: string, note?: string) {
    const { data } = await api.post<FavoriteEntry>('/favorites', { productId, note });
    return data;
  },
  async update(id: string, note?: string) {
    const { data } = await api.patch<FavoriteEntry>(`/favorites/${id}`, { note });
    return data;
  },
  async remove(id: string) {
    await api.delete(`/favorites/${id}`);
  },
};
