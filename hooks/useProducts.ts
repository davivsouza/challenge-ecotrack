import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { favoriteService } from '@/services/favoriteService';
import { historyService } from '@/services/historyService';
import { productService } from '@/services/productService';

export function useProducts(search?: string) {
  return useQuery({ queryKey: ['products', search], queryFn: () => productService.list(search) });
}

export function useProduct(id: string) {
  return useQuery({ queryKey: ['product', id], queryFn: () => productService.getById(id), enabled: Boolean(id) });
}

export function useLookupProduct() {
  return useMutation({ mutationFn: (barcode: string) => productService.getByBarcode(barcode) });
}

export function useHistory() {
  return useQuery({ queryKey: ['history'], queryFn: historyService.list });
}

export function useCreateHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, note }: { productId: string; note?: string }) => historyService.create(productId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useUpdateHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => historyService.update(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useDeleteHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => historyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useFavorites() {
  return useQuery({ queryKey: ['favorites'], queryFn: favoriteService.list });
}

export function useCreateFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, note }: { productId: string; note?: string }) => favoriteService.create(productId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useUpdateFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => favoriteService.update(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => favoriteService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
