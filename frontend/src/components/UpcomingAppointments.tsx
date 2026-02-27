import { useUpcomingAppointments, useCancelAppointment } from '../hooks/useAppointments';
import { formatDate, formatTime } from '../utils/dateUtils';

export const UpcomingAppointments = () => {
  const { data, isLoading, error } = useUpcomingAppointments();
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
        <div className="text-red-600 p-4 bg-red-50 rounded">Erro ao carregar agendamentos</div>
      </div>
    );
  }

  const appointments = data?.data || [];

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Nenhum agendamento próximo</p>
          <p className="text-sm">Clique em "Agendar" para reservar seu atendimento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg">
                  {appointment.service?.name || 'Serviço'}
                </p>
                <p className="text-gray-600 text-sm">
                  Com {appointment.barber?.user?.name || 'Barbeiro'}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  appointment.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {appointment.status === 'CONFIRMED' ? 'Confirmado' : 'Agendado'}
              </span>
            </div>

            <div className="flex items-center gap-6 mb-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">{formatDate(new Date(appointment.scheduled_start))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Horário</p>
                <p className="font-medium">{formatTime(new Date(appointment.scheduled_start))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duração</p>
                <p className="font-medium">{appointment.service?.duration_minutes || 30} min</p>
              </div>
            </div>

            <div className="flex gap-2">
              {appointment.status === 'SCHEDULED' && (
                <button
                  onClick={() => {
                    if (confirm('Deseja cancelar este agendamento?')) {
                      cancelAppointment(appointment.id);
                    }
                  }}
                  disabled={isCancelling}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
                >
                  {isCancelling ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
              <button className="px-4 py-2 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 text-sm font-medium">
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
