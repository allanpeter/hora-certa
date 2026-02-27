import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { Appointment } from './useAppointments';

export interface BarberStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  noShowRate: number;
  bookingRate: number;
  averageRating: number;
}

export const useBarberAppointmentsToday = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return useQuery<{ data: Appointment[] }>({
    queryKey: ['barber', 'appointments', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/appointments', {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          status: 'SCHEDULED,CONFIRMED,COMPLETED',
        },
      });
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useBarberAppointmentsWeek = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return useQuery<{ data: Appointment[] }>({
    queryKey: ['barber', 'appointments', 'week'],
    queryFn: async () => {
      const { data } = await api.get('/appointments', {
        params: {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
          status: 'SCHEDULED,CONFIRMED,COMPLETED,NO_SHOW',
        },
      });
      return data;
    },
  });
};

export const useBarberAppointmentsMonth = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return useQuery<{ data: Appointment[] }>({
    queryKey: ['barber', 'appointments', 'month'],
    queryFn: async () => {
      const { data } = await api.get('/appointments', {
        params: {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          status: 'SCHEDULED,CONFIRMED,COMPLETED,NO_SHOW',
        },
      });
      return data;
    },
  });
};

export const useBarberStats = () => {
  const { data: todayData } = useBarberAppointmentsToday();
  const { data: weekData } = useBarberAppointmentsWeek();
  const { data: monthData } = useBarberAppointmentsMonth();

  return useQuery<BarberStats>({
    queryKey: ['barber', 'stats'],
    queryFn: async () => {
      const today = todayData?.data || [];
      const week = weekData?.data || [];
      const month = monthData?.data || [];

      // Calculate revenue
      const calculateRevenue = (appointments: Appointment[]) =>
        appointments
          .filter((a) => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + (a.service?.price || 0), 0);

      const todayRevenue = calculateRevenue(today);
      const weekRevenue = calculateRevenue(week);
      const monthRevenue = calculateRevenue(month);
      const totalRevenue = monthRevenue; // Could fetch all-time data

      // Calculate no-show rate
      const totalWeekAppointments = week.length;
      const noShowCount = week.filter((a) => a.status === 'NO_SHOW').length;
      const noShowRate = totalWeekAppointments > 0 ? (noShowCount / totalWeekAppointments) * 100 : 0;

      // Calculate booking rate
      const confirmedCount = week.filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
      const bookingRate = totalWeekAppointments > 0 ? (confirmedCount / totalWeekAppointments) * 100 : 0;

      return {
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalAppointments: month.length,
        todayAppointments: today.length,
        upcomingAppointments: today.filter(
          (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
        ).length,
        noShowRate: Math.round(noShowRate),
        bookingRate: Math.round(bookingRate),
        averageRating: 4.8, // TODO: implement rating system
      };
    },
    enabled: !!todayData && !!weekData && !!monthData,
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const { data } = await api.patch(`/appointments/${appointmentId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber', 'appointments'] });
      queryClient.invalidateQueries({ queryKey: ['barber', 'stats'] });
    },
  });
};

export const useAddAppointmentNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes: string }) => {
      // This would need a new endpoint on the backend
      const { data } = await api.patch(`/appointments/${appointmentId}`, { notes });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
