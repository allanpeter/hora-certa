import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export interface Appointment {
  id: string;
  barber_id: string;
  customer_id: string;
  service_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  barber?: {
    user?: {
      name: string;
      avatar_url?: string;
    };
  };
  service?: {
    name: string;
    price: number;
    duration_minutes: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AppointmentResponse {
  data: Appointment[];
  total: number;
}

export const useAppointments = (params?: { status?: string; startDate?: string; endDate?: string }) => {
  return useQuery<AppointmentResponse>({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const { data } = await api.get('/appointments', { params });
      return data;
    },
  });
};

export const useAppointmentDetail = (appointmentId: string) => {
  return useQuery<Appointment>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const { data } = await api.get(`/appointments/${appointmentId}`);
      return data;
    },
    enabled: !!appointmentId,
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.delete(`/appointments/${appointmentId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.patch(`/reminders/appointments/${appointmentId}/confirm`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useDeclineAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data } = await api.patch(`/reminders/appointments/${appointmentId}/decline`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpcomingAppointments = () => {
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  return useQuery<AppointmentResponse>({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/appointments', {
        params: {
          status: 'SCHEDULED,CONFIRMED',
          startDate,
          endDate,
        },
      });
      return data;
    },
  });
};

export const usePastAppointments = () => {
  const now = new Date();
  const endDate = now.toISOString();
  const startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(); // 180 days

  return useQuery<AppointmentResponse>({
    queryKey: ['appointments', 'past'],
    queryFn: async () => {
      const { data } = await api.get('/appointments', {
        params: {
          status: 'COMPLETED,CANCELLED,NO_SHOW',
          startDate,
          endDate,
        },
      });
      return data;
    },
  });
};
