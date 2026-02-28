import { useState } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { Card, Input, Button, Alert } from '../components/FormElements';

export const SettingsPage = () => {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData, {
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setTimeout(() => setMessage(null), 3000);
      },
      onError: () => {
        setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
      <p className="text-gray-600 mb-8">Gerencie sua conta e preferências</p>

      {message && (
        <Alert
          variant={message.type === 'success' ? 'success' : 'error'}
          title={message.type === 'success' ? 'Sucesso' : 'Erro'}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Menu */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden sticky top-8">
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600">
                👤 Perfil
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition">
                🔒 Segurança
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition">
                🔔 Notificações
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition">
                💳 Pagamentos
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition">
                ❓ Ajuda
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card>
            <h2 className="text-xl font-bold mb-6">Informações Pessoais</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                helper="Email não pode ser alterado"
              />

              <Input
                label="Telefone"
                type="tel"
                name="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isPending}
              >
                💾 Salvar Alterações
              </Button>
            </form>
          </Card>

          {/* Account Section */}
          <Card>
            <h2 className="text-xl font-bold mb-6">Conta</h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Status da Conta</p>
                <p className="font-semibold text-green-600">✓ Verificada</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Membro desde</p>
                <p className="font-semibold">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>

              <Button variant="secondary" size="md">
                🔄 Alterar Senha
              </Button>
            </div>
          </Card>

          {/* Preferences Section */}
          <Card>
            <h2 className="text-xl font-bold mb-6">Preferências</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition cursor-pointer">
                <div>
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-gray-600">Receba lembretes de agendamentos</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition cursor-pointer">
                <div>
                  <p className="font-medium">Notificações por SMS</p>
                  <p className="text-sm text-gray-600">Receba SMS antes dos agendamentos</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition cursor-pointer">
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-gray-600">Usar tema escuro (em breve)</p>
                </div>
                <input type="checkbox" disabled className="w-5 h-5" />
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card>
            <h2 className="text-xl font-bold mb-6 text-red-600">Zona de Perigo</h2>

            <div className="space-y-3">
              <Button variant="danger" size="md">
                🗑️ Exportar Meus Dados
              </Button>
              <Button variant="danger" size="md">
                ⚠️ Deletar Conta
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
