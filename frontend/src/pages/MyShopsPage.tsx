import { useNavigate } from 'react-router-dom';
import { useMyShops } from '../hooks/useShops';
import { Button } from '../components/FormElements';
import { LoadingSpinner } from '../components/FormElements';

export function MyShopsPage() {
  const navigate = useNavigate();
  const { data: shops, isLoading, error } = useMyShops();

  const handleCreateShop = () => {
    navigate('/create-shop');
  };

  const handleManageShop = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Erro ao carregar barbearias
            </h2>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Tente novamente'}
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasShops = shops && shops.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Minhas Barbearias
              </h1>
              <p className="text-lg text-slate-600">
                Gerencie suas lojas e equipe
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateShop}
            >
              + Criar Nova Barbearia
            </Button>
          </div>

          {/* Shops Grid */}
          {hasShops ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
                    <h3 className="text-xl font-bold mb-1">{shop.name}</h3>
                    <p className="text-slate-200 text-sm">/{shop.slug}</p>
                  </div>

                  {/* Shop Info */}
                  <div className="p-6 space-y-4">
                    {/* Address */}
                    {shop.address && (
                      <div>
                        <p className="text-sm text-slate-600">Endereço</p>
                        <p className="text-slate-900 font-medium">
                          {shop.address}
                        </p>
                      </div>
                    )}

                    {/* Phone */}
                    {shop.phone && (
                      <div>
                        <p className="text-sm text-slate-600">Telefone</p>
                        <p className="text-slate-900 font-medium">
                          {shop.phone}
                        </p>
                      </div>
                    )}

                    {/* Subscription */}
                    <div>
                      <p className="text-sm text-slate-600">Plano</p>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-medium">
                          {shop.subscription_tier}
                        </span>
                        {shop.subscription_active ? (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Created Date */}
                    <div>
                      <p className="text-sm text-slate-600">Criada em</p>
                      <p className="text-slate-900 font-medium">
                        {new Date(shop.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleManageShop(shop.id)}
                      className="w-full"
                    >
                      Gerenciar Barbearia
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-12">
                <div className="text-6xl mb-4">🏪</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Nenhuma barbearia criada
                </h2>
                <p className="text-slate-600 mb-6">
                  Comece criando sua primeira barbearia para gerenciar
                  agendamentos, barbeiros e serviços.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateShop}
                  className="w-full"
                >
                  Criar Minha Primeira Barbearia
                </Button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Crie sua loja
                  </h3>
                  <p className="text-sm text-slate-600">
                    Configure nome, endereço e chave PIX
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Adicione barbeiros
                  </h3>
                  <p className="text-sm text-slate-600">
                    Convide sua equipe para trabalhar
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Receba agendamentos
                  </h3>
                  <p className="text-sm text-slate-600">
                    Clientes agendando seus serviços
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
