import { api } from '@/services/api';
import { HistoryEntry } from '@/types';

export const historyService = {
  async list() {
    const { data } = await api.get<HistoryEntry[]>('/history');
    return data;
  },
  async create(productId: string, note?: string) {
    const { data } = await api.post<HistoryEntry>('/history', { productId, note });
    return data;
  },
  async update(id: string, note?: string) {
    const { data } = await api.patch<HistoryEntry>(`/history/${id}`, { note });
    return data;
  },
  async remove(id: string) {
    await api.delete(`/history/${id}`);
  },
};
