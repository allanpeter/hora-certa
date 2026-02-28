import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBarbers, Barber } from '../hooks/useBarbers';
import { LoadingSpinner, Button, Alert } from '../components/FormElements';

type SortOption = 'rating' | 'name' | 'availability';
type FilterRating = 'all' | '5' | '4.5' | '4' | '3.5';

export function BarberDirectoryPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filterRating, setFilterRating] = useState<FilterRating>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: barbers, isLoading, error } = useBarbers(shopId || '', false);

  // Filter and sort barbers
  const filteredBarbers = useMemo(() => {
    if (!barbers) return [];

    let filtered = [...barbers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((b) =>
        b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bio?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by rating
    if (filterRating !== 'all') {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter((b) => b.rating >= minRating);
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
    } else if (sortBy === 'availability') {
      // Sort by having more working hours (complex barbers first)
      filtered.sort((a, b) => {
        const aHours = Object.keys(a.working_hours || {}).length;
        const bHours = Object.keys(b.working_hours || {}).length;
        return bHours - aHours;
      });
    }

    return filtered;
  }, [barbers, sortBy, filterRating, searchTerm]);

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
            Não conseguimos carregar a lista de barbeiros. Tente novamente.
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
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Nossos Barbeiros</h1>
          <p className="text-lg text-slate-600">Escolha seu barbeiro favorito e agende um horário</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter by Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Avaliação Mínima</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value as FilterRating)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as avaliações</option>
                <option value="5">⭐⭐⭐⭐⭐ 5.0+</option>
                <option value="4.5">⭐⭐⭐⭐ 4.5+</option>
                <option value="4">⭐⭐⭐⭐ 4.0+</option>
                <option value="3.5">⭐⭐⭐ 3.5+</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ordenar Por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Melhor Avaliação</option>
                <option value="name">Nome (A-Z)</option>
                <option value="availability">Mais Disponível</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredBarbers.length}</span> barbeiro
                {filteredBarbers.length !== 1 ? 's' : ''} encontrado
                {filteredBarbers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Barbers Grid */}
        {filteredBarbers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} shopId={shopId || ''} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-slate-600 mb-4">Nenhum barbeiro encontrado</p>
            <p className="text-slate-500">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface BarberCardProps {
  barber: Barber;
  shopId: string;
}

function BarberCard({ barber, shopId }: BarberCardProps) {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/barber/${barber.id}?shopId=${shopId}`);
  };

  const handleViewProfile = () => {
    navigate(`/barber/${barber.id}?shopId=${shopId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Profile Photo */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
        {barber.user?.avatar_url ? (
          <img
            src={barber.user.avatar_url}
            alt={barber.user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">💈</div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name & Rating */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{barber.user?.name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {'⭐'.repeat(Math.round(barber.rating))}
            </div>
            <span className="text-sm font-semibold text-slate-700">{barber.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bio */}
        {barber.bio && <p className="text-sm text-slate-600 mb-4 line-clamp-2">{barber.bio}</p>}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-slate-600">
          <div className="bg-blue-50 p-2 rounded">
            <span className="font-semibold text-blue-900">
              {barber.stats?.appointments_completed || 0}
            </span>
            <br />
            Agendamentos
          </div>
          <div className="bg-green-50 p-2 rounded">
            <span className="font-semibold text-green-900">
              {barber.stats ? `${Math.round(100 - barber.stats.no_show_rate)}%` : 'N/A'}
            </span>
            <br />
            Confiabilidade
          </div>
        </div>

        {/* Availability Badge */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-slate-600">Disponível hoje</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleBook} className="flex-1">
            Agendar
          </Button>
          <Button variant="secondary" size="sm" onClick={handleViewProfile} className="flex-1">
            Perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
