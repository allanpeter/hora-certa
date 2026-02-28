import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBarbers, useDeleteBarber, Barber } from '../hooks/useBarbers';
import { LoadingSpinner, Button, Alert } from '../components/FormElements';

export function BarbersManagementPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const { data: barbers, isLoading, error } = useBarbers(shopId || '', true);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteBarber = useDeleteBarber(selectedBarber || '', shopId || '');

  const handleAddBarber = () => {
    navigate(`/shop/${shopId}/barbers/new`);
  };

  const handleEditBarber = (barberId: string) => {
    navigate(`/shop/${shopId}/barbers/${barberId}/edit`);
  };

  const handleDeleteClick = (barberId: string) => {
    setSelectedBarber(barberId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBarber) {
      await deleteBarber.mutateAsync();
      setShowDeleteConfirm(false);
      setSelectedBarber(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Alert variant="error" title="Erro ao carregar barbeiros">
            Não conseguimos carregar a lista de barbeiros.
          </Alert>
          <Button variant="secondary" onClick={() => navigate(`/shop/${shopId}`)} className="mt-4">
            ← Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(`/shop/${shopId}`)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-4"
            >
              ← Voltar
            </button>
            <h1 className="text-4xl font-bold text-slate-900">Gerenciar Barbeiros</h1>
            <p className="text-slate-600 mt-2">Total: {barbers?.length || 0} barbeiro{barbers && barbers.length !== 1 ? 's' : ''}</p>
          </div>
          <Button variant="primary" size="lg" onClick={handleAddBarber}>
            + Adicionar Barbeiro
          </Button>
        </div>

        {/* Barbers List */}
        {barbers && barbers.length > 0 ? (
          <div className="space-y-4">
            {barbers.map((barber) => (
              <BarberManagementCard
                key={barber.id}
                barber={barber}
                onEdit={handleEditBarber}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💈</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum barbeiro adicionado</h3>
            <p className="text-slate-600 mb-6">Comece adicionando seus barbeiros à barbearia</p>
            <Button variant="primary" onClick={handleAddBarber}>
              Adicionar Primeiro Barbeiro
            </Button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Remover Barbeiro?</h3>
              <p className="text-slate-600 mb-6">
                Tem certeza que deseja remover este barbeiro? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedBarber(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  disabled={deleteBarber.isPending}
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteBarber.isPending ? 'Removendo...' : 'Remover'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BarberManagementCardProps {
  barber: Barber;
  onEdit: (barberId: string) => void;
  onDelete: (barberId: string) => void;
}

function BarberManagementCard({ barber, onEdit, onDelete }: BarberManagementCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {barber.user?.avatar_url ? (
            <img
              src={barber.user.avatar_url}
              alt={barber.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">💈</span>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{barber.user?.name}</h3>
              <p className="text-sm text-slate-600">{barber.user?.email}</p>
            </div>
            <div className="text-right">
              <div className="flex text-yellow-400 justify-end mb-1">
                {'⭐'.repeat(Math.round(barber.rating))}
              </div>
              <p className="font-bold text-slate-900">{barber.rating.toFixed(1)}</p>
            </div>
          </div>

          {/* Bio */}
          {barber.bio && <p className="text-slate-700 mb-3 line-clamp-2">{barber.bio}</p>}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatBox
              label="Agendamentos"
              value={barber.stats?.appointments_completed || 0}
              color="blue"
            />
            <StatBox label="Clientes" value={barber.stats?.total_customers || 0} color="green" />
            <StatBox
              label="Receita"
              value={`R$ ${barber.stats?.total_revenue.toFixed(0) || 0}`}
              color="purple"
            />
            <StatBox
              label="Taxa Falta"
              value={`${barber.stats?.no_show_rate.toFixed(0) || 0}%`}
              color="red"
            />
          </div>

          {/* Commission Info */}
          {barber.commission_percentage && (
            <p className="text-sm text-slate-600 mb-4">
              Comissão: <span className="font-semibold">{barber.commission_percentage}%</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => onEdit(barber.id)}>
              Editar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                /* View stats */
              }}
            >
              Estatísticas
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDelete(barber.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remover
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'red';
}

function StatBox({ label, value, color }: StatBoxProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    purple: 'bg-purple-50 text-purple-900',
    red: 'bg-red-50 text-red-900',
  };

  return (
    <div className={`${colorClasses[color]} p-3 rounded-lg text-center`}>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs font-medium opacity-75">{label}</p>
    </div>
  );
}
