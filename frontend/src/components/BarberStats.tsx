import { useBarberStats } from '../hooks/useBarberAppointments';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const BarberStats = () => {
  const { data: stats, isLoading } = useBarberStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Today's Revenue */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-l-4 border-green-600">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Receita Hoje</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{formatCurrency(stats.todayRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">
              {stats.todayAppointments} atendimentos
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
      </div>

      {/* Week Revenue */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-l-4 border-blue-600">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Esta Semana</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">{formatCurrency(stats.weekRevenue)}</p>
            <p className="text-xs text-blue-600 mt-1">
              Meta: {formatCurrency(stats.weekRevenue > 2000 ? stats.weekRevenue : 2000)}
            </p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>

      {/* Appointments Today */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border-l-4 border-purple-600">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Agendamentos</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">{stats.upcomingAppointments}</p>
            <p className="text-xs text-purple-600 mt-1">
              Próximas atendimentos
            </p>
          </div>
          <div className="text-4xl">📅</div>
        </div>
      </div>

      {/* No-Show Rate */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border-l-4 border-orange-600">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Taxa Falta</p>
            <p className="text-3xl font-bold text-orange-700 mt-2">{stats.noShowRate}%</p>
            <p className="text-xs text-orange-600 mt-1">
              Esta semana
            </p>
          </div>
          <div className="text-4xl">⚠️</div>
        </div>
      </div>
    </div>
  );
};
