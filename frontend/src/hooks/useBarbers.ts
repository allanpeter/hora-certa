import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

export interface Barber {
  id: string;
  tenant_id: string;
  user_id: string;
  bio: string | null;
  rating: number;
  commission_percentage: number | null;
  working_hours: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  stats?: BarberStats;
}

export interface BarberStats {
  total_revenue: number;
  appointments_completed: number;
  appointments_total: number;
  average_rating: number;
  repeat_customer_rate: number;
  no_show_rate: number;
  total_customers: number;
}

/**
 * Get all barbers in a shop
 */
export function useBarbers(shopId: string, includeStats: boolean = false) {
  return useQuery({
    queryKey: ['barbers', shopId, includeStats],
    queryFn: async () => {
      const { data } = await api.get<Barber[]>(`/barbers/shop/${shopId}`, {
        params: { includeStats },
      });
      return data;
    },
    enabled: !!shopId,
  });
}

/**
 * Get a specific barber
 */
export function useBarber(barberId: string, shopId?: string) {
  return useQuery({
    queryKey: ['barber', barberId, shopId],
    queryFn: async () => {
      const params = shopId ? { shopId } : {};
      const { data } = await api.get<Barber>(`/barbers/${barberId}`, { params });
      return data;
    },
    enabled: !!barberId,
  });
}

/**
 * Create a new barber (owner/manager only)
 */
export function useCreateBarber(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: { user_id: string; bio?: string; commission_percentage?: number; working_hours?: Record<string, any> }) => {
      const { data } = await api.post<Barber>('/barbers', {
        ...userData,
        shop_id: shopId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers', shopId] });
    },
  });
}

/**
 * Update a barber
 */
export function useUpdateBarber(barberId: string, shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: { bio?: string; commission_percentage?: number; working_hours?: Record<string, any> }) => {
      const { data } = await api.patch<Barber>(`/barbers/${barberId}`, {
        ...userData,
        shop_id: shopId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber', barberId] });
      queryClient.invalidateQueries({ queryKey: ['barbers', shopId] });
    },
  });
}

/**
 * Delete a barber
 */
export function useDeleteBarber(barberId: string, shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ success: boolean }>(`/barbers/${barberId}`, {
        data: { shop_id: shopId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers', shopId] });
      queryClient.removeQueries({ queryKey: ['barber', barberId] });
    },
  });
}

/**
 * Get barber performance statistics
 */
export function useBarberStats(barberId: string, shopId: string) {
  return useQuery({
    queryKey: ['barber-stats', barberId, shopId],
    queryFn: async () => {
      const { data } = await api.get<BarberStats>(`/barbers/${barberId}/stats`, {
        params: { shopId },
      });
      return data;
    },
    enabled: !!barberId && !!shopId,
  });
}
