import { useQuery } from '@tanstack/react-query';
import api from '../config/api';

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  method: 'PIX' | 'CARD' | 'POS';
  external_id?: string;
  paid_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse {
  data: Payment[];
  total: number;
}

export const usePayments = (params?: { status?: string; method?: string; startDate?: string; endDate?: string }) => {
  return useQuery<PaymentResponse>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params });
      return data;
    },
  });
};

export const usePaymentHistory = () => {
  const now = new Date();
  const endDate = now.toISOString();
  const startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(); // 180 days

  return useQuery<PaymentResponse>({
    queryKey: ['payments', 'history'],
    queryFn: async () => {
      const { data } = await api.get('/payments', {
        params: {
          startDate,
          endDate,
        },
      });
      return data;
    },
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/payments');

      const stats = {
        totalSpent: 0,
        lastPaymentDate: null as string | null,
        paymentMethods: {} as Record<string, number>,
        paymentStatuses: {} as Record<string, number>,
      };

      if (data.data && Array.isArray(data.data)) {
        stats.totalSpent = data.data.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

        // Get most recent paid payment
        const paidPayments = data.data
          .filter((p: Payment) => p.status === 'PAID')
          .sort((a: Payment, b: Payment) => new Date(b.paid_at || '').getTime() - new Date(a.paid_at || '').getTime());

        if (paidPayments.length > 0) {
          stats.lastPaymentDate = paidPayments[0].paid_at || null;
        }

        // Count by method
        data.data.forEach((payment: Payment) => {
          stats.paymentMethods[payment.method] = (stats.paymentMethods[payment.method] || 0) + 1;
          stats.paymentStatuses[payment.status] = (stats.paymentStatuses[payment.status] || 0) + 1;
        });
      }

      return stats;
    },
  });
};
