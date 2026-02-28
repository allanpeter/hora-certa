import { useMemo } from 'react';
import { useBarberAppointmentsWeek } from '../hooks/useBarberAppointments';
import { formatTime } from '../utils/dateUtils';

export const WeekCalendar = () => {
  const { data, isLoading } = useBarberAppointmentsWeek();

  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return days;
  }, []);

  const appointments = data?.data || [];

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduled_start);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300';
      case 'CONFIRMED':
        return 'bg-blue-100 border-blue-300';
      case 'SCHEDULED':
        return 'bg-yellow-100 border-yellow-300';
      case 'NO_SHOW':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Calendário Semanal</h2>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Calendário Semanal</h2>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((date, idx) => {
          const dayAppointments = getAppointmentsForDay(date);
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={idx}
              className={`rounded-lg border-2 p-3 min-h-64 ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-center mb-3">
                <p className="font-bold text-sm">{dayNames[date.getDay()]}</p>
                <p className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {date.getDate()}
                </p>
                <p className="text-xs text-gray-500">
                  {date.toLocaleDateString('pt-BR', { month: 'short' })}
                </p>
              </div>

              <div className="space-y-2">
                {dayAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Sem agendamentos</p>
                ) : (
                  dayAppointments
                    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className={`p-2 rounded border border-gray-300 text-xs ${getStatusColor(apt.status)}`}
                      >
                        <p className="font-semibold text-gray-800 truncate">
                          Cliente
                        </p>
                        <p className="text-gray-700 truncate">Serviço</p>
                        <p className="text-gray-600 font-medium">
                          {formatTime(new Date(apt.scheduled_start))}
                        </p>
                      </div>
                    ))
                )}
              </div>

              {dayAppointments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                  <p className="text-gray-600">
                    {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-500">
                    Receita:{' '}
                    {dayAppointments
                      .filter((a) => a.status === 'COMPLETED')
                      .reduce((sum, a) => sum + (a.service?.price || 0), 0)
                      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
