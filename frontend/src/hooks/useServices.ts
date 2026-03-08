import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category: 'HAIR' | 'BEARD' | 'COMBO' | 'PRODUCT';
  icon_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServices = (shopId: string) => {
  return useQuery<Service[]>({
    queryKey: ['services', shopId],
    queryFn: async () => {
      const { data } = await api.get(`/services/tenant/${shopId}`);
      return data;
    },
    enabled: !!shopId,
  });
};

export const useCreateService = (shopId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: {
      name: string;
      price: number;
      duration_minutes: number;
      category: 'HAIR' | 'BEARD' | 'COMBO' | 'PRODUCT';
      description?: string;
    }) => {
      const { data } = await api.post('/services', {
        ...serviceData,
        tenant_id: shopId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', shopId] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, ...updates }: Partial<Service> & { serviceId: string }) => {
      const { data } = await api.patch(`/services/${serviceId}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      await api.delete(`/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useToggleService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { data } = await api.patch(`/services/${serviceId}/toggle`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
