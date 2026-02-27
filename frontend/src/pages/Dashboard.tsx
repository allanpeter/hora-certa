import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../stores/auth.store';
import { UpcomingAppointments } from '../components/UpcomingAppointments';
import { PaymentHistory } from '../components/PaymentHistory';
import { LoyaltyPoints } from '../components/LoyaltyPoints';

export const Dashboard = () => {
  const { data: profile, isLoading } = useProfile();
  const { user, logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-gray-300 rounded animate-pulse mb-8"></div>
            <div className="h-96 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.name || user?.name || 'Usuário';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hora Certa</h1>
            <p className="text-sm text-gray-500">Seu gerenciador de agendamentos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">Bem-vindo, {userName}!</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Próximo Agendamento</p>
                <p className="text-2xl font-bold text-gray-900">Em breve</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pontos de Fidelidade</p>
                <p className="text-2xl font-bold text-gray-900">+5/mês</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Métodos de Pagamento</p>
                <p className="text-2xl font-bold text-gray-900">PIX, Cartão</p>
              </div>
              <div className="text-3xl">💳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ações Rápidas</p>
                <button className="mt-2 px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Agendar
                </button>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Upcoming & History */}
          <div className="lg:col-span-2 space-y-8">
            <UpcomingAppointments />
          </div>

          {/* Right Column - Loyalty & Stats */}
          <div className="space-y-8">
            <LoyaltyPoints />

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Meu Perfil</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-semibold text-gray-900">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{profile?.email}</p>
                </div>
                {profile?.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-semibold text-gray-900">{profile.phone}</p>
                  </div>
                )}
              </div>
              <button className="mt-4 w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition">
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Payment History - Full Width */}
        <div>
          <PaymentHistory />
        </div>

        {/* Helpful Links Section */}
        <div className="mt-12 bg-blue-50 rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Precisa de Ajuda?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold text-gray-900">Suporte</p>
              <p className="text-sm text-gray-600">Entre em contato conosco</p>
            </div>
            <div>
              <div className="text-3xl mb-2">❓</div>
              <p className="font-semibold text-gray-900">FAQ</p>
              <p className="text-sm text-gray-600">Dúvidas frequentes</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎓</div>
              <p className="font-semibold text-gray-900">Tutorial</p>
              <p className="text-sm text-gray-600">Como usar a plataforma</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
