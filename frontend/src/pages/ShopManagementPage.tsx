import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useShopById,
  useUpdateShop,
  useShopStaff,
  useAddStaffMember,
  useUpdateStaffRole,
  useRemoveStaffMember,
} from '../hooks/useShops';
import { Input, Button, LoadingSpinner, Alert } from '../components/FormElements';

export function ShopManagementPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  // Queries and mutations
  const shopQuery = useShopById(shopId);
  const updateShop = useUpdateShop(shopId!);
  const staffQuery = useShopStaff(shopId);
  const addStaff = useAddStaffMember(shopId!);
  const updateStaffRole = useUpdateStaffRole(shopId!);
  const removeStaff = useRemoveStaffMember(shopId!);

  // State
  const [editMode, setEditMode] = useState(false);
  const [editedShop, setEditedShop] = useState<any>(null);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'BARBER' | 'RECEPTIONIST' | 'MANAGER'>('BARBER');
  const [selectedStaffForRole, setSelectedStaffForRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'BARBER' | 'RECEPTIONIST' | 'MANAGER' | 'OWNER'>('BARBER');

  if (shopQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (shopQuery.isError || !shopQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="error" title="Barbearia não encontrada">
            A barbearia solicitada não existe ou você não tem acesso.
          </Alert>
          <Button
            variant="primary"
            onClick={() => navigate('/shops')}
            className="mt-4"
          >
            Voltar para minhas barbearias
          </Button>
        </div>
      </div>
    );
  }

  const shop = shopQuery.data;

  const handleEditShop = () => {
    setEditedShop({ ...shop });
    setEditMode(true);
  };

  const handleSaveShop = async () => {
    try {
      await updateShop.mutateAsync({
        name: editedShop.name,
        address: editedShop.address,
        phone: editedShop.phone,
        pix_key: editedShop.pix_key,
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStaff.mutateAsync({
        email: staffEmail,
        role: staffRole,
      });
      setStaffEmail('');
      setStaffRole('BARBER');
      setShowAddStaffForm(false);
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleUpdateStaffRole = async (tenantUserId: string) => {
    try {
      await updateStaffRole.mutateAsync({
        tenantUserId,
        role: newRole as 'BARBER' | 'RECEPTIONIST' | 'MANAGER',
      });
      setSelectedStaffForRole(null);
    } catch (error) {
      console.error('Error updating staff role:', error);
    }
  };

  const handleRemoveStaff = async (tenantUserId: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      try {
        await removeStaff.mutateAsync(tenantUserId);
      } catch (error) {
        console.error('Error removing staff:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/shops')}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-4xl font-bold text-slate-900 flex-1 text-center">
            {shop.name}
          </h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shop Details Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Detalhes da Loja
              </h2>

              {updateShop.isError && (
                <div className="mb-4">
                  <Alert variant="error" title="Erro ao atualizar">
                    {updateShop.error instanceof Error
                      ? updateShop.error.message
                      : 'Erro ao atualizar barbearia'}
                  </Alert>
                </div>
              )}

              {editMode && editedShop ? (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <Input
                    label="Nome"
                    value={editedShop.name}
                    onChange={(e) =>
                      setEditedShop({ ...editedShop, name: e.target.value })
                    }
                  />
                  <Input
                    label="Endereço"
                    value={editedShop.address || ''}
                    onChange={(e) =>
                      setEditedShop({ ...editedShop, address: e.target.value })
                    }
                  />
                  <Input
                    label="Telefone"
                    value={editedShop.phone || ''}
                    onChange={(e) =>
                      setEditedShop({ ...editedShop, phone: e.target.value })
                    }
                  />
                  <Input
                    label="Chave PIX"
                    value={editedShop.pix_key || ''}
                    onChange={(e) =>
                      setEditedShop({ ...editedShop, pix_key: e.target.value })
                    }
                  />
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveShop}
                      disabled={updateShop.isPending}
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Nome</p>
                    <p className="font-semibold text-slate-900">{shop.name}</p>
                  </div>
                  {shop.address && (
                    <div>
                      <p className="text-sm text-slate-600">Endereço</p>
                      <p className="font-semibold text-slate-900">
                        {shop.address}
                      </p>
                    </div>
                  )}
                  {shop.phone && (
                    <div>
                      <p className="text-sm text-slate-600">Telefone</p>
                      <p className="font-semibold text-slate-900">
                        {shop.phone}
                      </p>
                    </div>
                  )}
                  {shop.pix_key && (
                    <div>
                      <p className="text-sm text-slate-600">Chave PIX</p>
                      <p className="font-semibold text-slate-900">
                        {shop.pix_key}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Plano</p>
                    <p className="font-semibold text-slate-900">
                      {shop.subscription_tier}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEditShop}
                    className="w-full mt-4"
                  >
                    Editar Informações
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Staff Management Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Equipe
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                >
                  {showAddStaffForm ? '✕ Cancelar' : '+ Adicionar Membro'}
                </Button>
              </div>

              {/* Add Staff Form */}
              {showAddStaffForm && (
                <form
                  onSubmit={handleAddStaff}
                  className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Adicionar Membro da Equipe
                  </h3>

                  {addStaff.isError && (
                    <div className="mb-4">
                      <Alert variant="error" title="Erro">
                        {addStaff.error instanceof Error
                          ? addStaff.error.message
                          : 'Erro ao adicionar membro'}
                      </Alert>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Input
                      label="Email"
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="barbeiro@example.com"
                      required
                    />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Função
                      </label>
                      <select
                        value={staffRole}
                        onChange={(e) =>
                          setStaffRole(
                            e.target.value as
                              | 'BARBER'
                              | 'RECEPTIONIST'
                              | 'MANAGER'
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BARBER">Barbeiro</option>
                        <option value="RECEPTIONIST">Recepção</option>
                        <option value="MANAGER">Gerente</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={addStaff.isPending}
                        className="w-full"
                      >
                        {addStaff.isPending ? 'Adicionando...' : 'Adicionar'}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    💡 O membro precisa ter uma conta na plataforma antes de
                    ser adicionado.
                  </p>
                </form>
              )}

              {/* Staff List */}
              {staffQuery.isLoading ? (
                <LoadingSpinner size="md" />
              ) : staffQuery.data && staffQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {staffQuery.data.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {member.role === 'OWNER' ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            Proprietário
                          </span>
                        ) : selectedStaffForRole === member.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newRole}
                              onChange={(e) =>
                                setNewRole(
                                  e.target.value as
                                    | 'BARBER'
                                    | 'RECEPTIONIST'
                                    | 'MANAGER'
                                )
                              }
                              className="px-2 py-1 border border-slate-300 rounded text-sm"
                            >
                              <option value="BARBER">Barbeiro</option>
                              <option value="RECEPTIONIST">Recepção</option>
                              <option value="MANAGER">Gerente</option>
                            </select>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                handleUpdateStaffRole(member.id)
                              }
                              disabled={updateStaffRole.isPending}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedStaffForRole(null)}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {member.role === 'BARBER'
                                ? 'Barbeiro'
                                : member.role === 'RECEPTIONIST'
                                  ? 'Recepção'
                                  : 'Gerente'}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedStaffForRole(member.id);
                                if (member.role !== 'OWNER') {
                                  setNewRole(member.role as 'BARBER' | 'RECEPTIONIST' | 'MANAGER');
                                }
                              }}
                            >
                              Alterar
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRemoveStaff(member.id)}
                              disabled={removeStaff.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remover
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <p className="mb-4">Nenhum membro da equipe adicionado</p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddStaffForm(true)}
                  >
                    Adicionar Primeiro Membro
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
