import { useState } from 'react';
import { useBarberAppointmentsToday, useUpdateAppointmentStatus } from '../hooks/useBarberAppointments';
import { formatTime, formatDate } from '../utils/dateUtils';

export const TodayAppointments = () => {
  const { data, isLoading, error } = useBarberAppointmentsToday();
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Agendamentos de Hoje</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Agendamentos de Hoje</h2>
        <div className="text-red-600 p-4 bg-red-50 rounded">Erro ao carregar agendamentos</div>
      </div>
    );
  }

  const appointments = data?.data || [];
  const sortedAppointments = appointments.sort(
    (a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime(),
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Agendamentos de Hoje</h2>

      {appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Sem agendamentos hoje</p>
          <p className="text-sm">Aproveite para descansar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`border-2 rounded-lg p-4 transition ${
                selectedAppointment === appointment.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {appointment.customer?.name || 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.service?.name}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'NO_SHOW'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕐</span>
                  <span className="font-medium">{formatTime(new Date(appointment.scheduled_start))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <span className="text-sm">{appointment.service?.duration_minutes || 30} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="font-semibold">{formatCurrency(appointment.service?.price || 0)}</span>
                </div>
              </div>

              {appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' ? (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      updateStatus({ appointmentId: appointment.id, status: 'COMPLETED' });
                    }}
                    disabled={isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition"
                  >
                    ✓ Concluído
                  </button>
                  <button
                    onClick={() => {
                      updateStatus({ appointmentId: appointment.id, status: 'NO_SHOW' });
                    }}
                    disabled={isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition"
                  >
                    ✗ Não compareceu
                  </button>
                  <button
                    onClick={() => setSelectedAppointment(selectedAppointment === appointment.id ? null : appointment.id)}
                    className="px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50 text-sm font-medium transition"
                  >
                    📝 Notas
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  {appointment.status === 'COMPLETED' ? 'Atendimento concluído' : 'Cliente não compareceu'}
                </div>
              )}

              {selectedAppointment === appointment.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Notas do atendimento:</p>
                  <textarea
                    placeholder="Adicione notas sobre o atendimento..."
                    className="w-full p-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition">
                    Salvar Notas
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Concluído',
    NO_SHOW: 'Não compareceu',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
