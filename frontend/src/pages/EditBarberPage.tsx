import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBarber, useUpdateBarber } from '../hooks/useBarbers';
import { Input, TextArea, Button, LoadingSpinner, Alert } from '../components/FormElements';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

interface WorkingHoursDay {
  start_hour: number | null;
  start_minute: number | null;
  end_hour: number | null;
  end_minute: number | null;
  lunch_start_hour?: number | null;
  lunch_start_minute?: number | null;
  lunch_end_hour?: number | null;
  lunch_end_minute?: number | null;
}

interface WorkingHours {
  [key: string]: WorkingHoursDay;
}

export function EditBarberPage() {
  const { shopId, barberId } = useParams<{ shopId: string; barberId: string }>();
  const navigate = useNavigate();

  const { data: barber, isLoading, error } = useBarber(barberId || '', shopId);
  const updateBarber = useUpdateBarber(barberId || '', shopId || '');

  const [formData, setFormData] = useState({
    bio: '',
    commission_percentage: '',
    working_hours: {} as WorkingHours,
  });

  const [selectedTab, setSelectedTab] = useState<'basic' | 'hours'>('basic');
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with barber data
  useEffect(() => {
    if (barber) {
      setFormData({
        bio: barber.bio || '',
        commission_percentage: barber.commission_percentage?.toString() || '',
        working_hours: barber.working_hours || initializeWorkingHours(),
      });
    }
  }, [barber]);

  const initializeWorkingHours = (): WorkingHours => {
    return DAYS.reduce(
      (acc, day) => {
        acc[day.key] = {
          start_hour: 9,
          start_minute: 0,
          end_hour: 18,
          end_minute: 0,
          lunch_start_hour: 12,
          lunch_start_minute: 0,
          lunch_end_hour: 13,
          lunch_end_minute: 0,
        };
        return acc;
      },
      {} as WorkingHours,
    );
  };

  const handleSave = async () => {
    await updateBarber.mutateAsync({
      bio: formData.bio,
      commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : undefined,
      working_hours: formData.working_hours,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !barber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Alert variant="error" title="Erro ao carregar barbeiro">
            Não conseguimos carregar os dados do barbeiro.
          </Alert>
          <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
            ← Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-6"
        >
          ← Voltar
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Editar Barbeiro</h1>
          <p className="text-slate-600">{barber.user?.name}</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert variant="success" title="Sucesso!">
            Informações do barbeiro atualizadas com sucesso.
          </Alert>
        )}

        {/* Error Message */}
        {updateBarber.isError && (
          <Alert variant="error" title="Erro ao salvar">
            {updateBarber.error instanceof Error ? updateBarber.error.message : 'Erro ao atualizar barbeiro'}
          </Alert>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setSelectedTab('basic')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition ${
                selectedTab === 'basic'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Informações Básicas
            </button>
            <button
              onClick={() => setSelectedTab('hours')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition ${
                selectedTab === 'hours'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horários de Trabalho
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === 'basic' && (
              <div className="space-y-6">
                <TextArea
                  label="Bio/Descrição"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Ex: Especialista em cortes modernos e barba impecável"
                  rows={4}
                />

                <Input
                  label="Comissão (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                  placeholder="Ex: 25"
                  helper="Percentual de comissão que este barbeiro recebe"
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> Configure os horários de trabalho na aba "Horários de Trabalho" para que
                    clientes possam ver a disponibilidade.
                  </p>
                </div>
              </div>
            )}

            {selectedTab === 'hours' && <WorkingHoursTab formData={formData} setFormData={setFormData} />}
          </div>

          {/* Save Button */}
          <div className="border-t border-slate-200 p-8 flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={updateBarber.isPending}
              onClick={handleSave}
            >
              {updateBarber.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkingHoursTabProps {
  formData: {
    bio: string;
    commission_percentage: string;
    working_hours: WorkingHours;
  };
  setFormData: (data: any) => void;
}

function WorkingHoursTab({ formData, setFormData }: WorkingHoursTabProps) {
  const updateDay = (dayKey: DayKey, field: string, value: any) => {
    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours,
        [dayKey]: {
          ...formData.working_hours[dayKey],
          [field]: value === '' ? null : parseInt(value, 10),
        },
      },
    });
  };

  const toggleDayOff = (dayKey: DayKey) => {
    const isOff =
      formData.working_hours[dayKey]?.start_hour === null;

    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours,
        [dayKey]: isOff
          ? {
              start_hour: 9,
              start_minute: 0,
              end_hour: 18,
              end_minute: 0,
              lunch_start_hour: 12,
              lunch_start_minute: 0,
              lunch_end_hour: 13,
              lunch_end_minute: 0,
            }
          : {
              start_hour: null,
              start_minute: null,
              end_hour: null,
              end_minute: null,
              lunch_start_hour: null,
              lunch_start_minute: null,
              lunch_end_hour: null,
              lunch_end_minute: null,
            },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Configure os horários de funcionamento:</strong> Defina os horários de início e fim do dia,
          bem como os horários de almoço. Clique na linha para marcar como "Fechado" nesse dia.
        </p>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const dayHours = formData.working_hours[day.key];
          const isOff = dayHours?.start_hour === null;

          return (
            <div
              key={day.key}
              className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                isOff
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
              onClick={() => toggleDayOff(day.key)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 pt-2">
                  <h4 className="font-bold text-slate-900">{day.label}</h4>
                </div>

                {!isOff ? (
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Início (h)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={dayHours?.start_hour ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'start_hour', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="15"
                        value={dayHours?.start_minute ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'start_minute', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Fim (h)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={dayHours?.end_hour ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'end_hour', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Minutos</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="15"
                        value={dayHours?.end_minute ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'end_minute', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 pt-2">
                    <span className="text-sm font-semibold text-gray-500">FECHADO</span>
                  </div>
                )}
              </div>

              {!isOff && dayHours?.lunch_start_hour !== null && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 block mb-2">
                    Horário de Almoço
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={dayHours?.lunch_start_hour ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'lunch_start_hour', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="h início"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="15"
                        value={dayHours?.lunch_start_minute ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'lunch_start_minute', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="min"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={dayHours?.lunch_end_hour ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'lunch_end_hour', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="h fim"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="15"
                        value={dayHours?.lunch_end_minute ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDay(day.key, 'lunch_end_minute', e.target.value);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="min"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-900">
          <strong>Dica:</strong> Clique em um dia para marcar como fechado. Clique novamente para abrir.
        </p>
      </div>
    </div>
  );
}
