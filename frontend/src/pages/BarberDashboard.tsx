import { useAuthStore } from '../stores/auth.store';
import { BarberStats } from '../components/BarberStats';
import { TodayAppointments } from '../components/TodayAppointments';
import { WeekCalendar } from '../components/WeekCalendar';

export const BarberDashboard = () => {
  const { user, logout } = useAuthStore();

  const userName = user?.name || 'Barbeiro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hora Certa - Painel do Barbeiro</h1>
            <p className="text-sm text-gray-500">Gerencie seus atendimentos e receita</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">Barbeiro</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <BarberStats />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Today's Appointments (2 columns) */}
          <div className="lg:col-span-2">
            <TodayAppointments />
          </div>

          {/* Right Column - Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2">
                  📅 Adicionar Pausa
                </button>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2">
                  ⭐ Avaliar Dia
                </button>
                <button className="w-full py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm font-medium flex items-center justify-center gap-2">
                  📊 Ver Relatório
                </button>
              </div>
            </div>

            {/* Tips & Goals */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow p-6 border-l-4 border-amber-600">
              <h3 className="text-lg font-bold mb-3 text-amber-900">💡 Dica do Dia</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                Mantenha seu perfil atualizado com fotos de seus trabalhos. Clientes com referências visuais marcam mais agendamentos!
              </p>
            </div>

            {/* Performance Badges */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">🏆 Desempenho</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taxa Confirmação</span>
                  <span className="text-lg font-bold text-green-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">Avaliação Média</span>
                  <span className="text-lg font-bold text-yellow-600">⭐ 4.8/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`text-lg ${i <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Calendar */}
        <div className="mb-8">
          <WeekCalendar />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Week Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">📅 Próxima Semana</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Você tem <span className="font-bold text-blue-600">12 agendamentos</span> próxima semana.
              </p>
              <p className="text-sm text-gray-600">
                Receita estimada: <span className="font-bold text-green-600">R$ 840,00</span>
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">Dias com mais demanda:</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Sexta-feira</span>
                    <span className="font-semibold">5 agendamentos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sábado</span>
                    <span className="font-semibold">4 agendamentos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">👥 Clientes</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Clientes Recorrentes</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
                <p className="text-xs text-gray-500">Dos últimos 30 dias</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Taxa de Retenção</p>
                <p className="text-2xl font-bold text-green-600">72%</p>
                <p className="text-xs text-gray-500">Clientes que retornam</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
