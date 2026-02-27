import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  user_type: string;
  email_verified: boolean;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/profile');
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data } = await api.patch('/users/profile', updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      const profile = await api.get('/users/profile');
      const appointments = await api.get('/appointments?status=COMPLETED');
      const payments = await api.get('/payments');

      return {
        totalAppointments: appointments.data?.total || 0,
        totalSpent:
          payments.data?.data?.reduce((sum: number, p: any) => sum + (p.status === 'PAID' ? p.amount : 0), 0) || 0,
        user: profile.data,
      };
    },
  });
};
