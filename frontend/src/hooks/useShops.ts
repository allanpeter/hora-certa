import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export interface Shop {
  id: string;
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  pix_key?: string;
  logo_url?: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  subscription_tier: string;
  subscription_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'BARBER' | 'RECEPTIONIST';
  user_type: string;
}

/**
 * Create a new barber shop
 */
export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopData: {
      slug: string;
      name: string;
      address?: string;
      phone?: string;
      pix_key?: string;
    }) => {
      const { data } = await api.post('/tenants', shopData);
      return data;
    },
    onSuccess: () => {
      // Invalidate shops list to refetch
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

/**
 * Get all shops where user is a member
 */
export const useMyShops = () => {
  return useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data } = await api.get('/tenants');
      return data;
    },
  });
};

/**
 * Get specific shop details
 */
export const useShopById = (shopId?: string) => {
  return useQuery<Shop>({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      const { data } = await api.get(`/tenants/${shopId}`);
      return data;
    },
    enabled: !!shopId,
  });
};

/**
 * Update shop details
 */
export const useUpdateShop = (shopId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Shop>) => {
      const { data } = await api.patch(`/tenants/${shopId}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

/**
 * Get staff members of a shop
 */
export const useShopStaff = (shopId?: string) => {
  return useQuery<StaffMember[]>({
    queryKey: ['shop', shopId, 'staff'],
    queryFn: async () => {
      const { data } = await api.get(`/tenants/${shopId}/staff`);
      return data;
    },
    enabled: !!shopId,
  });
};

/**
 * Add a staff member to a shop
 */
export const useAddStaffMember = (shopId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffData: {
      email: string;
      role: 'BARBER' | 'RECEPTIONIST' | 'MANAGER';
    }) => {
      const { data } = await api.post(`/tenants/${shopId}/staff`, staffData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId, 'staff'] });
    },
  });
};

/**
 * Update staff member role
 */
export const useUpdateStaffRole = (shopId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      tenantUserId: string;
      role: 'BARBER' | 'RECEPTIONIST' | 'MANAGER';
    }) => {
      const { data: response } = await api.patch(
        `/tenants/${shopId}/staff/${data.tenantUserId}/role`,
        { role: data.role }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId, 'staff'] });
    },
  });
};

/**
 * Remove staff member from shop
 */
export const useRemoveStaffMember = (shopId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantUserId: string) => {
      await api.delete(`/tenants/${shopId}/staff/${tenantUserId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId, 'staff'] });
    },
  });
};

/**
 * Delete a shop (soft delete, only if empty)
 */
export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      await api.delete(`/tenants/${shopId}`);
    },
    onSuccess: () => {
      // Invalidate shops list to refresh
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};
