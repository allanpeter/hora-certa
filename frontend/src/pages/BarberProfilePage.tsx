import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useBarber, useBarberStats } from '../hooks/useBarbers';
import { LoadingSpinner, Button, Alert } from '../components/FormElements';

export function BarberProfilePage() {
  const { barberId } = useParams<{ barberId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shopId = searchParams.get('shopId') || '';

  const { data: barber, isLoading, error } = useBarber(barberId || '', shopId);
  const { data: stats } = useBarberStats(barberId || '', shopId);

  const [selectedTab, setSelectedTab] = useState<'services' | 'availability' | 'reviews'>('services');

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
        <div className="container mx-auto px-4 max-w-6xl">
          <Alert variant="error" title="Erro ao carregar perfil">
            Não conseguimos carregar o perfil do barbeiro. Tente novamente.
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
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-6"
        >
          ← Voltar
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Photo */}
            <div className="flex flex-col items-center">
              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {barber.user?.avatar_url ? (
                  <img
                    src={barber.user.avatar_url}
                    alt={barber.user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-8xl">💈</div>
                )}
              </div>
              <Button variant="primary" size="lg" className="w-full">
                Agendar Agora
              </Button>
            </div>

            {/* Middle & Right: Info */}
            <div className="md:col-span-2">
              {/* Name & Rating */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">{barber.user?.name}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-2xl">
                      {'⭐'.repeat(Math.round(barber.rating))}
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-slate-900">{barber.rating.toFixed(1)}</span>
                      <p className="text-sm text-slate-600">
                        ({stats?.appointments_completed || 0} avaliações)
                      </p>
                    </div>
                  </div>
                </div>

                {barber.bio && (
                  <p className="text-lg text-slate-700 mb-4">{barber.bio}</p>
                )}
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.appointments_completed || 0}
                  </div>
                  <p className="text-sm text-slate-600">Agendamentos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats ? `${Math.round(100 - stats.no_show_rate)}%` : 'N/A'}
                  </div>
                  <p className="text-sm text-slate-600">Confiabilidade</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.repeat_customer_rate.toFixed(0) || 0}%
                  </div>
                  <p className="text-sm text-slate-600">Clientes Fixos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setSelectedTab('services')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition ${
                selectedTab === 'services'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Serviços
            </button>
            <button
              onClick={() => setSelectedTab('availability')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition ${
                selectedTab === 'availability'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disponibilidade
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition ${
                selectedTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Avaliações
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === 'services' && <ServicesTab />}
            {selectedTab === 'availability' && <AvailabilityTab workingHours={barber.working_hours} />}
            {selectedTab === 'reviews' && <ReviewsTab barberRating={barber.rating} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesTab() {
  // Mock services - in real app would come from API
  const services = [
    { id: '1', name: 'Corte de Cabelo', price: 50, duration: 30 },
    { id: '2', name: 'Barba', price: 30, duration: 20 },
    { id: '3', name: 'Corte + Barba', price: 70, duration: 50 },
    { id: '4', name: 'Tratamento Capilar', price: 80, duration: 45 },
  ];

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
        >
          <div>
            <h4 className="font-semibold text-slate-900">{service.name}</h4>
            <p className="text-sm text-slate-600">{service.duration} minutos</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">R$ {service.price}</p>
            <Button variant="primary" size="sm">
              Agendar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AvailabilityTabProps {
  workingHours: Record<string, any> | null;
}

function AvailabilityTab({ workingHours }: AvailabilityTabProps) {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-3">
      {days.map((day, idx) => {
        const hours = workingHours?.[dayKeys[idx]];
        const isOpen = hours && hours.start_hour !== null;

        return (
          <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <span className="font-semibold text-slate-900 w-24">{day}</span>
            <span className="text-slate-700">
              {isOpen
                ? `${String(hours.start_hour).padStart(2, '0')}:${String(hours.start_minute).padStart(2, '0')} - ${String(hours.end_hour).padStart(2, '0')}:${String(hours.end_minute).padStart(2, '0')}`
                : 'Fechado'}
            </span>
            {isOpen && hours.lunch_start && (
              <span className="text-sm text-slate-600">
                Almoço: {String(hours.lunch_start_hour).padStart(2, '0')}:
                {String(hours.lunch_start_minute).padStart(2, '0')}
              </span>
            )}
          </div>
        );
      })}
      <Button variant="primary" className="w-full mt-6">
        Ver Horários Disponíveis
      </Button>
    </div>
  );
}

interface ReviewsTabProps {
  barberRating: number;
}

function ReviewsTab({ barberRating }: ReviewsTabProps) {
  // Mock reviews - in real app would come from API
  const reviews = [
    {
      id: '1',
      customer: 'João Silva',
      rating: 5,
      date: '2026-02-24',
      service: 'Corte de Cabelo',
      comment: 'Excelente profissional! Muito atencioso e fez um corte perfeito.',
    },
    {
      id: '2',
      customer: 'Pedro Santos',
      rating: 5,
      date: '2026-02-20',
      service: 'Corte + Barba',
      comment: 'Ótimo atendimento, recomendo!',
    },
    {
      id: '3',
      customer: 'Carlos Costa',
      rating: 4,
      date: '2026-02-18',
      service: 'Barba',
      comment: 'Bom trabalho, mas demorou um pouco mais que o esperado.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-50 p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex text-yellow-400 text-3xl mb-2">
              {'⭐'.repeat(Math.round(barberRating))}
            </div>
            <p className="text-2xl font-bold text-slate-900">{barberRating.toFixed(1)}</p>
            <p className="text-sm text-slate-600">Baseado em {reviews.length} avaliações</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{review.customer}</h4>
                <p className="text-sm text-slate-600">
                  {review.service} • {new Date(review.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex text-yellow-400 text-lg">
                {'⭐'.repeat(review.rating)}
              </div>
            </div>
            <p className="text-slate-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
