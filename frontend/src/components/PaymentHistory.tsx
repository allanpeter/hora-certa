import { usePaymentHistory, usePaymentStats } from '../hooks/usePayments';
import { formatDate, formatCurrency } from '../utils/dateUtils';

export const PaymentHistory = () => {
  const { data, isLoading, error } = usePaymentHistory();
  const { data: stats } = usePaymentStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Histórico de Pagamentos</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Histórico de Pagamentos</h2>
        <div className="text-red-600 p-4 bg-red-50 rounded">Erro ao carregar histórico</div>
      </div>
    );
  }

  const payments = data?.data || [];

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'PIX':
        return 'bg-purple-100 text-purple-800';
      case 'CARD':
        return 'bg-blue-100 text-blue-800';
      case 'POS':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      FAILED: 'Falhou',
      REFUNDED: 'Reembolsado',
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Histórico de Pagamentos</h2>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
          <div>
            <p className="text-gray-600 text-sm">Total Gasto</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Último Pagamento</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.lastPaymentDate ? formatDate(new Date(stats.lastPaymentDate)) : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum pagamento registrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Data</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Valor</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Método</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    {payment.paid_at ? formatDate(new Date(payment.paid_at)) : formatDate(new Date(payment.created_at))}
                  </td>
                  <td className="py-3 px-2 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMethodBadgeColor(payment.method)}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
