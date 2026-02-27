import { useState } from 'react';
import { useUpcomingAppointments, usePastAppointments } from '../hooks/useAppointments';
import { Card, Badge, Button } from '../components/FormElements';
import { formatDate, formatTime, daysUntil } from '../utils/dateUtils';

type TabType = 'upcoming' | 'past';

export const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingAppointments();
  const { data: pastData, isLoading: pastLoading } = usePastAppointments();

  const upcomingAppointments = upcomingData?.data || [];
  const pastAppointments = pastData?.data || [];

  const isLoading = activeTab === 'upcoming' ? upcomingLoading : pastLoading;
  const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SCHEDULED: { variant: 'warning' as const, label: 'Agendado' },
      CONFIRMED: { variant: 'success' as const, label: 'Confirmado' },
      COMPLETED: { variant: 'success' as const, label: 'Concluído' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelado' },
      NO_SHOW: { variant: 'danger' as const, label: 'Não compareceu' },
    };
    return statusMap[status as keyof typeof statusMap] || { variant: 'default' as const, label: status };
  };

  const getTimeUntil = (dateString: string) => {
    const days = daysUntil(new Date(dateString));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    if (days > 0) return `Em ${days} dias`;
    return 'Vencido';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h1>
      <p className="text-gray-600 mb-8">Visualize e gerencie todos os seus agendamentos</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'upcoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Próximos ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'past'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Histórico ({pastAppointments.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-2xl mb-2">
            {activeTab === 'upcoming' ? '📭' : '📋'}
          </p>
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming'
              ? 'Nenhum agendamento próximo'
              : 'Nenhum agendamento anterior'}
          </p>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming'
              ? 'Reserve seu atendimento agora'
              : 'Seus agendamentos anteriores aparecerão aqui'}
          </p>
          {activeTab === 'upcoming' && (
            <Button variant="primary" size="md">
              ✨ Agendar Agora
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const badge = getStatusBadge(appointment.status);

            return (
              <Card key={appointment.id} className="cursor-pointer hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Main Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {appointment.service?.name || 'Serviço'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Com {appointment.barber?.user?.name || 'Barbeiro'}
                        </p>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>

                    {appointment.service && (
                      <p className="text-xs text-gray-500 mt-2">
                        Duração: {appointment.service.duration_minutes} min
                      </p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Data e Hora</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(new Date(appointment.scheduled_start))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(new Date(appointment.scheduled_start))}
                    </p>
                    {activeTab === 'upcoming' && (
                      <p className="text-xs text-blue-600 mt-1">
                        {getTimeUntil(appointment.scheduled_start)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {appointment.status === 'SCHEDULED' && (
                      <>
                        <Button variant="primary" size="sm">
                          ✓ Confirmar
                        </Button>
                        <Button variant="danger" size="sm">
                          ✕ Cancelar
                        </Button>
                      </>
                    )}

                    {appointment.status === 'CONFIRMED' && (
                      <>
                        <Button variant="secondary" size="sm">
                          🔄 Remarcar
                        </Button>
                        <Button variant="danger" size="sm">
                          ✕ Cancelar
                        </Button>
                      </>
                    )}

                    {(appointment.status === 'COMPLETED' ||
                      appointment.status === 'CANCELLED' ||
                      appointment.status === 'NO_SHOW') && (
                      <>
                        <Button variant="secondary" size="sm">
                          👁️ Ver Detalhes
                        </Button>
                        {appointment.status === 'COMPLETED' && (
                          <Button variant="ghost" size="sm">
                            ⭐ Avaliar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {activeTab === 'upcoming' && upcomingAppointments.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Próximo Agendamento</p>
            <p className="text-lg font-bold">
              {upcomingAppointments.length > 0
                ? formatDate(new Date(upcomingAppointments[0].scheduled_start))
                : '-'}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 mb-1">Total de Agendamentos</p>
            <p className="text-lg font-bold">{upcomingAppointments.length}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 mb-1">Confirmados</p>
            <p className="text-lg font-bold text-green-600">
              {upcomingAppointments.filter((a) => a.status === 'CONFIRMED').length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
