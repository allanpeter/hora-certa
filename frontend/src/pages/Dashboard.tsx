import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useAuthStore } from '../stores/auth.store';
import { UpcomingAppointments } from '../components/UpcomingAppointments';
import { PaymentHistory } from '../components/PaymentHistory';
import { LoyaltyPoints } from '../components/LoyaltyPoints';

type UserType = 'CLIENT' | 'OWNER' | 'BARBER' | 'RECEPTIONIST' | 'ADMIN';

export const Dashboard = () => {
  const { data: profile, isLoading } = useProfile();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const userName = profile?.name || user?.name || 'Usuário';
  const userType = (profile?.user_type || 'CLIENT') as UserType;

  const handleBecomeOwner = async () => {
    setIsUpdatingRole(true);
    try {
      await updateProfile.mutateAsync({ user_type: 'OWNER' });
      setShowRoleModal(false);
      navigate('/create-shop');
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hora Certa</h1>
            <p className="text-sm text-gray-500">
              {userType === 'OWNER' || userType === 'BARBER' || userType === 'RECEPTIONIST'
                ? 'Seu gerenciador de barbearia'
                : 'Seu gerenciador de agendamentos'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                Bem-vindo, {isLoading ? <span className="text-gray-400">Carregando...</span> : userName}!
              </p>
              <p className="text-sm text-gray-500">{profile?.email || (isLoading ? 'Carregando email...' : user?.email)}</p>
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

      {/* Role Confirmation Modal */}
      {showRoleModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowRoleModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">💈</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Se tornar Dono de Barbearia
                </h2>
                <p className="text-gray-600">
                  Você está prestes a se tornar um proprietário. Isso mudará seu perfil e você terá acesso a ferramentas de gerenciamento.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ Você poderá gerenciar sua barbearia, adicionar funcionários e receber agendamentos.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBecomeOwner}
                  disabled={isUpdatingRole}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                >
                  {isUpdatingRole ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
