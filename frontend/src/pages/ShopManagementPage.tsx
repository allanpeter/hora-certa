import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useShopById,
  useUpdateShop,
  useShopStaff,
  useAddStaffMember,
  useUpdateStaffRole,
  useRemoveStaffMember,
  useDeleteShop,
} from '../hooks/useShops';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleService,
  type Service,
} from '../hooks/useServices';
import { useAppointments } from '../hooks/useAppointments';
import { useUpdateAppointmentStatus } from '../hooks/useBarberAppointments';
import { useCancelAppointment } from '../hooks/useAppointments';
import { Input, Button, LoadingSpinner, Alert, Badge, Select, TextArea, Toast } from '../components/FormElements';
import { Modal, ConfirmDialog } from '../components/Modal';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

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
  const deleteShop = useDeleteShop();

  // Appointments state (must be before hooks that use it)
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('');
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<string | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const [newAppointmentStatus, setNewAppointmentStatus] = useState('CONFIRMED');

  // Services hooks
  const servicesQuery = useServices(shopId || '');
  const createService = useCreateService(shopId || '');
  const updateServiceMutation = useUpdateService();
  const deleteService = useDeleteService();
  const toggleService = useToggleService();

  // Appointments hooks
  const appointmentsQuery = useAppointments({
    status: appointmentStatusFilter || undefined,
  });
  const updateAppointmentStatus = useUpdateAppointmentStatus();
  const cancelAppointment = useCancelAppointment();

  // Tab state
  const [activeTab, setActiveTab] = useState<'details' | 'services' | 'staff' | 'appointments'>('details');

  // Shop Details state
  const [editMode, setEditMode] = useState(false);
  const [editedShop, setEditedShop] = useState<any>(null);

  // Staff state
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'BARBER' | 'RECEPTIONIST' | 'MANAGER'>('BARBER');
  const [selectedStaffForRole, setSelectedStaffForRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'BARBER' | 'RECEPTIONIST' | 'MANAGER' | 'OWNER'>('BARBER');
  const [removingStaffId, setRemovingStaffId] = useState<string | null>(null);

  // Services state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    category: 'HAIR' as 'HAIR' | 'BEARD' | 'COMBO' | 'PRODUCT',
  });

  // Shop deletion state
  const [confirmDeleteShop, setConfirmDeleteShop] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Watch for errors and show toasts
  useEffect(() => {
    if (addStaff.isError) {
      showToast(getFriendlyErrorMessage(addStaff.error), 'error');
    }
  }, [addStaff.isError, addStaff.error]);

  useEffect(() => {
    if (updateShop.isError) {
      showToast(getFriendlyErrorMessage(updateShop.error), 'error');
    }
  }, [updateShop.isError, updateShop.error]);

  useEffect(() => {
    if (createService.isError) {
      showToast(getFriendlyErrorMessage(createService.error), 'error');
    }
  }, [createService.isError, createService.error]);

  useEffect(() => {
    if (updateServiceMutation.isError) {
      showToast(getFriendlyErrorMessage(updateServiceMutation.error), 'error');
    }
  }, [updateServiceMutation.isError, updateServiceMutation.error]);

  useEffect(() => {
    if (deleteShop.isError) {
      showToast(getFriendlyErrorMessage(deleteShop.error), 'error');
    }
  }, [deleteShop.isError, deleteShop.error]);

  // Handle successful shop deletion
  useEffect(() => {
    if (deleteShop.isSuccess) {
      showToast('Barbearia removida com sucesso!', 'success');
      setTimeout(() => navigate('/shops'), 1500);
    }
  }, [deleteShop.isSuccess, navigate]);

  // Cleanup when switching tabs
  useEffect(() => {
    // Close modals
    setShowServiceModal(false);
    setEditingService(null);
    setShowAddStaffForm(false);
    setSelectedStaffForRole(null);

    // Reset form data
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      category: 'HAIR',
    });
    setStaffEmail('');
    setStaffRole('BARBER');

    // Reset deletion/action states
    setDeletingServiceId(null);
    setRemovingStaffId(null);
    setCancelingAppointmentId(null);
    setChangingStatusId(null);
    setAppointmentStatusFilter('');
  }, [activeTab]);

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

  // ==================== HANDLERS ====================

  const handleEditShop = () => {
    setEditedShop({ ...shop });
    setEditMode(true);
  };

  const handleDeleteShop = async () => {
    try {
      await deleteShop.mutateAsync(shopId!);
    } catch (error) {
      // Error is handled by useEffect hook
    }
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
      showToast(`${staffEmail} foi adicionado à equipe com sucesso!`, 'success');
      setStaffEmail('');
      setStaffRole('BARBER');
      setShowAddStaffForm(false);
    } catch (error) {
      // Error is handled by useEffect hook
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
    try {
      await removeStaff.mutateAsync(tenantUserId);
      setRemovingStaffId(null);
    } catch (error) {
      console.error('Error removing staff:', error);
    }
  };

  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration_minutes: service.duration_minutes.toString(),
        category: service.category,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        category: 'HAIR',
      });
    }
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      category: 'HAIR',
    });
  };

  const handleSaveService = async () => {
    try {
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        category: serviceForm.category,
        ...(serviceForm.duration_minutes && {
          duration_minutes: parseInt(serviceForm.duration_minutes, 10),
        }),
      };

      if (editingService) {
        await updateServiceMutation.mutateAsync({
          serviceId: editingService.id,
          ...serviceData,
        } as any);
      } else {
        await createService.mutateAsync(serviceData as any);
      }
      handleCloseServiceModal();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteServiceAction = async (serviceId: string) => {
    try {
      await deleteService.mutateAsync(serviceId);
      setDeletingServiceId(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleServiceAction = async (serviceId: string) => {
    try {
      await toggleService.mutateAsync(serviceId);
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await updateAppointmentStatus.mutateAsync({
        appointmentId,
        status: status as 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW',
      });
      setChangingStatusId(null);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      setCancelingAppointmentId(null);
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  // ==================== RENDER ====================

  const tabs = [
    { id: 'details', label: 'Detalhes' },
    { id: 'services', label: 'Serviços' },
    { id: 'staff', label: 'Equipe' },
    { id: 'appointments', label: 'Agendamentos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
          <div className="w-20" />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8 bg-white rounded-t-lg">
          <div className="flex gap-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-8">
          {/* TAB: Detalhes */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Detalhes da Loja</h2>

              {editMode && editedShop ? (
                <form className="space-y-4">
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
                      <p className="font-semibold text-slate-900">{shop.address}</p>
                    </div>
                  )}
                  {shop.phone && (
                    <div>
                      <p className="text-sm text-slate-600">Telefone</p>
                      <p className="font-semibold text-slate-900">{shop.phone}</p>
                    </div>
                  )}
                  {shop.pix_key && (
                    <div>
                      <p className="text-sm text-slate-600">Chave PIX</p>
                      <p className="font-semibold text-slate-900">{shop.pix_key}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Plano</p>
                    <p className="font-semibold text-slate-900">
                      {shop.subscription_tier}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEditShop}
                      className="flex-1 mt-4"
                    >
                      Editar Informações
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDeleteShop(true)}
                      className="flex-1 mt-4"
                    >
                      Remover Barbearia
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Serviços */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Serviços</h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenServiceModal()}
                >
                  + Adicionar Serviço
                </Button>
              </div>

              {servicesQuery.isLoading ? (
                <LoadingSpinner size="md" />
              ) : servicesQuery.data && servicesQuery.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          Nome
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          Categoria
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          Preço
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          Duração
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicesQuery.data.map((service) => (
                        <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3">{service.name}</td>
                          <td className="px-4 py-3 capitalize">
                            {service.category === 'HAIR'
                              ? 'Cabelo'
                              : service.category === 'BEARD'
                                ? 'Barba'
                                : service.category === 'COMBO'
                                  ? 'Combo'
                                  : 'Produto'}
                          </td>
                          <td className="px-4 py-3">R$ {service.price.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            {service.category === 'PRODUCT' ? '-' : `${service.duration_minutes} min`}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={service.active ? 'success' : 'default'}>
                              {service.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleServiceAction(service.id)}
                                className="text-xs px-2 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                              >
                                {service.active ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                onClick={() => handleOpenServiceModal(service)}
                                className="text-xs px-2 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setDeletingServiceId(service.id)}
                                className="text-xs px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <p className="mb-4">Nenhum serviço cadastrado</p>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenServiceModal()}
                  >
                    Adicionar Primeiro Serviço
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB: Equipe */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Equipe</h2>
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
                  className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-4"
                >
                  <h3 className="font-semibold text-slate-900">
                    Adicionar Membro da Equipe
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="barbeiro@example.com"
                      required
                    />
                    <Select
                      label="Função"
                      value={staffRole}
                      onChange={(e) =>
                        setStaffRole(e.target.value as 'BARBER' | 'RECEPTIONIST' | 'MANAGER')
                      }
                      options={[
                        { value: 'BARBER', label: 'Barbeiro' },
                        { value: 'RECEPTIONIST', label: 'Recepção' },
                        { value: 'MANAGER', label: 'Gerente' },
                      ]}
                    />
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
                        <p className="font-semibold text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {member.role === 'OWNER' ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            Proprietário
                          </span>
                        ) : selectedStaffForRole === member.id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={newRole}
                              onChange={(e) =>
                                setNewRole(
                                  e.target.value as 'BARBER' | 'RECEPTIONIST' | 'MANAGER'
                                )
                              }
                              options={[
                                { value: 'BARBER', label: 'Barbeiro' },
                                { value: 'RECEPTIONIST', label: 'Recepção' },
                                { value: 'MANAGER', label: 'Gerente' },
                              ]}
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleUpdateStaffRole(member.id)}
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
                              onClick={() => setRemovingStaffId(member.id)}
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
          )}

          {/* TAB: Agendamentos */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Agendamentos</h2>

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                {['', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(
                  (status) => (
                    <button
                      key={status || 'all'}
                      onClick={() => setAppointmentStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        appointmentStatusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === ''
                        ? 'Todos'
                        : status === 'SCHEDULED'
                          ? 'Agendado'
                          : status === 'CONFIRMED'
                            ? 'Confirmado'
                            : status === 'COMPLETED'
                              ? 'Concluído'
                              : status === 'CANCELLED'
                                ? 'Cancelado'
                                : 'No-show'}
                    </button>
                  )
                )}
              </div>

              {appointmentsQuery.isLoading ? (
                <LoadingSpinner size="md" />
              ) : appointmentsQuery.data?.data && appointmentsQuery.data.data.length > 0 ? (
                <div className="space-y-3">
                  {appointmentsQuery.data.data.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {appointment.barber?.user?.name || 'Barbeiro não especificado'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {appointment.service?.name || 'Serviço'} • {appointment.service?.duration_minutes || 0}
                            min •{' '}
                            {appointment.service?.price
                              ? `R$ ${appointment.service.price.toFixed(2)}`
                              : ''}
                          </p>
                        </div>
                        <Badge
                          variant={
                            appointment.status === 'COMPLETED'
                              ? 'success'
                              : appointment.status === 'CONFIRMED'
                                ? 'warning'
                                : appointment.status === 'SCHEDULED'
                                  ? 'info'
                                  : 'danger'
                          }
                        >
                          {appointment.status === 'SCHEDULED'
                            ? 'Agendado'
                            : appointment.status === 'CONFIRMED'
                              ? 'Confirmado'
                              : appointment.status === 'COMPLETED'
                                ? 'Concluído'
                                : appointment.status === 'NO_SHOW'
                                  ? 'No-show'
                                  : 'Cancelado'}
                        </Badge>
                      </div>

                      <div className="text-sm text-slate-600 mb-3">
                        {new Date(appointment.scheduled_start).toLocaleDateString('pt-BR')}{' '}
                        às{' '}
                        {new Date(appointment.scheduled_start).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {appointment.status === 'SCHEDULED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setChangingStatusId(appointment.id);
                              setNewAppointmentStatus('CONFIRMED');
                            }}
                          >
                            Confirmar
                          </Button>
                        )}

                        {appointment.status === 'CONFIRMED' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setChangingStatusId(appointment.id);
                                setNewAppointmentStatus('COMPLETED');
                              }}
                            >
                              Concluído
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setChangingStatusId(appointment.id);
                                setNewAppointmentStatus('NO_SHOW');
                              }}
                            >
                              No-show
                            </Button>
                          </>
                        )}

                        {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setCancelingAppointmentId(appointment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  Nenhum agendamento encontrado para o filtro selecionado
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Service Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={handleCloseServiceModal}
        title={editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={serviceForm.name}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, name: e.target.value })
            }
            placeholder="Ex: Corte Simples"
            required
          />

          <Select
            label="Categoria"
            value={serviceForm.category}
            onChange={(e) =>
              setServiceForm({
                ...serviceForm,
                category: e.target.value as any,
              })
            }
            options={[
              { value: 'HAIR', label: 'Cabelo' },
              { value: 'BEARD', label: 'Barba' },
              { value: 'COMBO', label: 'Combo' },
              { value: 'PRODUCT', label: 'Produto' },
            ]}
          />

          <Input
            label="Preço (R$)"
            type="number"
            value={serviceForm.price}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, price: e.target.value })
            }
            placeholder="35.00"
            min="0"
            step="0.01"
            required
          />

          {serviceForm.category !== 'PRODUCT' && (
            <Input
              label="Duração (minutos)"
              type="number"
              value={serviceForm.duration_minutes}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, duration_minutes: e.target.value })
              }
              placeholder="30"
              min="1"
              required
            />
          )}

          <TextArea
            label="Descrição"
            value={serviceForm.description}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, description: e.target.value })
            }
            placeholder="Descrição do serviço (opcional)"
            rows={3}
          />

          <div className="flex gap-2 pt-4">
            <Button
              variant="primary"
              onClick={handleSaveService}
              disabled={
                !serviceForm.name ||
                !serviceForm.price ||
                (serviceForm.category !== 'PRODUCT' && !serviceForm.duration_minutes) ||
                createService.isPending ||
                updateServiceMutation.isPending
              }
            >
              {createService.isPending || updateServiceMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="secondary" onClick={handleCloseServiceModal}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Shop Confirm */}
      <ConfirmDialog
        isOpen={confirmDeleteShop}
        onConfirm={handleDeleteShop}
        onCancel={() => setConfirmDeleteShop(false)}
        title="Remover Barbearia"
        message="Tem certeza que deseja remover esta barbearia? Esta ação não pode ser desfeita."
        confirmText="Remover"
        variant="danger"
        loading={deleteShop.isPending}
      />

      {/* Delete Service Confirm */}
      <ConfirmDialog
        isOpen={!!deletingServiceId}
        onConfirm={() =>
          deletingServiceId && handleDeleteServiceAction(deletingServiceId)
        }
        onCancel={() => setDeletingServiceId(null)}
        title="Excluir Serviço"
        message="Tem certeza que deseja excluir este serviço?"
        confirmText="Excluir"
        variant="danger"
        loading={deleteService.isPending}
      />

      {/* Remove Staff Confirm */}
      <ConfirmDialog
        isOpen={!!removingStaffId}
        onConfirm={() =>
          removingStaffId && handleRemoveStaff(removingStaffId)
        }
        onCancel={() => setRemovingStaffId(null)}
        title="Remover Membro da Equipe"
        message="Tem certeza que deseja remover este membro?"
        confirmText="Remover"
        variant="danger"
        loading={removeStaff.isPending}
      />

      {/* Cancel Appointment Confirm */}
      <ConfirmDialog
        isOpen={!!cancelingAppointmentId}
        onConfirm={() =>
          cancelingAppointmentId && handleCancelAppointment(cancelingAppointmentId)
        }
        onCancel={() => setCancelingAppointmentId(null)}
        title="Cancelar Agendamento"
        message="Tem certeza que deseja cancelar este agendamento?"
        confirmText="Cancelar"
        variant="danger"
        loading={cancelAppointment.isPending}
      />

      {/* Update Appointment Status Confirm */}
      <ConfirmDialog
        isOpen={!!changingStatusId}
        onConfirm={() =>
          changingStatusId && handleUpdateAppointmentStatus(changingStatusId, newAppointmentStatus)
        }
        onCancel={() => setChangingStatusId(null)}
        title="Atualizar Status"
        message={`Deseja alterar o status para ${
          newAppointmentStatus === 'COMPLETED'
            ? 'Concluído'
            : newAppointmentStatus === 'NO_SHOW'
              ? 'No-show'
              : 'Confirmado'
        }?`}
        confirmText="Confirmar"
        loading={updateAppointmentStatus.isPending}
      />
    </div>
  );
}
