import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBarber, useBarberStats, BarberStats } from '../hooks/useBarbers';
import { LoadingSpinner, Button, Alert } from '../components/FormElements';

type TimePeriod = 'month' | 'quarter' | 'year';

export function BarberPerformancePage() {
  const { shopId, barberId } = useParams<{ shopId: string; barberId: string }>();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  const { data: barber, isLoading: barberLoading } = useBarber(barberId || '', shopId);
  const { data: stats, isLoading: statsLoading } = useBarberStats(barberId || '', shopId || '');

  if (barberLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!barber || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Alert variant="error" title="Erro ao carregar dados">
            Não conseguimos carregar as informações de desempenho.
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-6"
        >
          ← Voltar
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Desempenho</h1>
            <p className="text-lg text-slate-600">{barber.user?.name}</p>
          </div>

          {/* Time Period Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimePeriod('month')}
              className={`px-4 py-2 rounded font-semibold transition ${
                timePeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setTimePeriod('quarter')}
              className={`px-4 py-2 rounded font-semibold transition ${
                timePeriod === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setTimePeriod('year')}
              className={`px-4 py-2 rounded font-semibold transition ${
                timePeriod === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Ano
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={`R$ ${stats.total_revenue.toFixed(2)}`}
            icon="💰"
            color="blue"
            change="+12.5%"
          />
          <MetricCard
            title="Agendamentos"
            value={stats.appointments_completed.toString()}
            icon="📅"
            color="green"
            change="+8"
          />
          <MetricCard
            title="Avaliação"
            value={`${stats.average_rating.toFixed(1)} ⭐`}
            icon="⭐"
            color="yellow"
            subtitle={`${stats.appointments_completed} avaliações`}
          />
          <MetricCard
            title="Taxa de Falta"
            value={`${stats.no_show_rate.toFixed(1)}%`}
            icon="❌"
            color={stats.no_show_rate > 10 ? 'red' : 'green'}
            subtitle="Deve estar < 5%"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Chart */}
          <ChartCard title="Tendência de Receita (Últimos 30 dias)">
            <RevenueTrendChart />
          </ChartCard>

          {/* Appointments Chart */}
          <ChartCard title="Agendamentos por Dia (Últimos 7 dias)">
            <AppointmentsChart />
          </ChartCard>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Services */}
          <ChartCard title="Serviços Mais Agendados">
            <ServiceBreakdown />
          </ChartCard>

          {/* Stats */}
          <ChartCard title="Comparativo com Shop">
            <ComparisonStats stats={stats} />
          </ChartCard>

          {/* Insights */}
          <ChartCard title="Principais Insights">
            <Insights stats={stats} />
          </ChartCard>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Ações</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => {
                /* Download report */
              }}
            >
              📥 Baixar Relatório
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                /* Share report */
              }}
            >
              📤 Compartilhar
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/shop/${shopId}/barbers/${barberId}/edit`)}
            >
              ✏️ Editar Informações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  change?: string;
  subtitle?: string;
}

function MetricCard({ title, value, icon, color, change, subtitle }: MetricCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`${colorMap[color]} border-2 rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-600">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
      {change && <p className="text-sm text-green-600 font-semibold">{change} vs. período anterior</p>}
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      {children}
    </div>
  );
}

function RevenueTrendChart() {
  // Mock data - in real app would use Chart.js or Recharts
  const data = [
    { day: 1, revenue: 150 },
    { day: 2, revenue: 200 },
    { day: 3, revenue: 175 },
    { day: 4, revenue: 250 },
    { day: 5, revenue: 220 },
    { day: 6, revenue: 300 },
    { day: 7, revenue: 280 },
    // ... more data
  ];

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.day} className="flex items-center gap-4">
          <div className="w-8 text-sm font-semibold text-slate-600">Dia {item.day}</div>
          <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-full flex items-center justify-end pr-3"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            >
              {(item.revenue / maxRevenue) * 100 > 15 && (
                <span className="text-xs font-bold text-white">R$ {item.revenue}</span>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-sm font-semibold text-slate-700">
          Receita Total: <span className="text-blue-600">R$ 1.575</span>
        </p>
      </div>
    </div>
  );
}

function AppointmentsChart() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
  const appointments = [4, 5, 3, 6, 7, 8, 2];
  const maxAppointments = Math.max(...appointments);

  return (
    <div className="flex items-end justify-around gap-2 h-64">
      {days.map((day, idx) => (
        <div key={day} className="flex flex-col items-center gap-2 flex-1">
          <div
            className="w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t"
            style={{ height: `${(appointments[idx] / maxAppointments) * 100}%` }}
          ></div>
          <div className="h-12 flex items-end justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{appointments[idx]}</p>
              <p className="text-xs text-slate-600">{day}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceBreakdown() {
  const services = [
    { name: 'Corte de Cabelo', count: 42, percent: 45 },
    { name: 'Corte + Barba', count: 28, percent: 30 },
    { name: 'Barba', count: 15, percent: 16 },
    { name: 'Tratamento', count: 8, percent: 9 },
  ];

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.name}>
          <div className="flex justify-between mb-1">
            <p className="text-sm font-semibold text-slate-900">{service.name}</p>
            <p className="text-sm text-slate-600">{service.count}</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-full"
              style={{ width: `${service.percent}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ComparisonStatsProps {
  stats: BarberStats;
}

function ComparisonStats({ stats }: ComparisonStatsProps) {
  // Mock shop averages
  const shopAverage = {
    rating: 4.2,
    appointments: 85,
    revenue: 2500,
    noShowRate: 8,
  };

  const comparisons = [
    {
      label: 'Avaliação',
      barber: stats.average_rating,
      shop: shopAverage.rating,
      unit: '⭐',
    },
    {
      label: 'Agendamentos',
      barber: stats.appointments_completed,
      shop: shopAverage.appointments,
      unit: '',
    },
    {
      label: 'Receita (R$)',
      barber: Math.round(stats.total_revenue),
      shop: shopAverage.revenue,
      unit: '',
    },
    {
      label: 'Taxa de Falta',
      barber: stats.no_show_rate,
      shop: shopAverage.noShowRate,
      unit: '%',
      inverted: true,
    },
  ];

  return (
    <div className="space-y-3">
      {comparisons.map((item) => {
        const isAboveAverage = item.inverted ? item.barber < item.shop : item.barber > item.shop;
        const difference = Math.abs(item.barber - item.shop).toFixed(1);

        return (
          <div key={item.label} className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-900">{item.label}</span>
              <span className={isAboveAverage ? 'text-green-600 font-bold' : 'text-orange-600'}>
                {isAboveAverage ? '↑' : '↓'} {difference}{item.unit}
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-slate-600">Você: {item.barber.toFixed(1)}{item.unit}</span>
              <span className="text-slate-400">→</span>
              <span className="text-slate-600">Shop: {item.shop.toFixed(1)}{item.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface InsightsProps {
  stats: BarberStats;
}

function Insights({ stats }: InsightsProps) {
  const insights = [
    {
      icon: '📈',
      text: `Crescimento de ${stats.repeat_customer_rate.toFixed(0)}% em clientes fixos`,
      color: 'green',
    },
    {
      icon: '🎯',
      text: `Taxa de ${Math.round(100 - stats.no_show_rate)}% de confiabilidade`,
      color: stats.no_show_rate < 5 ? 'green' : 'orange',
    },
    {
      icon: '⭐',
      text: `Avaliação ${stats.average_rating.toFixed(1)} de 5.0`,
      color: stats.average_rating >= 4.5 ? 'green' : 'orange',
    },
    {
      icon: '💰',
      text: `Faturou R$ ${stats.total_revenue.toFixed(0)} este período`,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => (
        <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
          <span className="text-2xl flex-shrink-0">{insight.icon}</span>
          <p className="text-sm text-slate-700">{insight.text}</p>
        </div>
      ))}
    </div>
  );
}
