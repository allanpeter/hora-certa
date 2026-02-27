import { useAppointments } from '../hooks/useAppointments';

export const LoyaltyPoints = () => {
  const { data, isLoading } = useAppointments({ status: 'COMPLETED' });

  const completedAppointments = data?.data?.filter((a) => a.status === 'COMPLETED') || [];

  // Calculate loyalty points: 1 point per BRL spent
  const loyaltyPoints = Math.floor(completedAppointments.length * 100 || 0);

  // Calculate rewards tier
  const getTier = (points: number) => {
    if (points >= 1000) return { name: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (points >= 500) return { name: 'Silver', color: 'text-gray-400', bgColor: 'bg-gray-50' };
    return { name: 'Bronze', color: 'text-amber-600', bgColor: 'bg-amber-50' };
  };

  const tier = getTier(loyaltyPoints);

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow p-6 ${tier.bgColor}`}>
        <h2 className="text-xl font-bold mb-4">Programa de Fidelidade</h2>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const rewards = [
    { points: 100, description: 'Próximo corte 10% desconto' },
    { points: 500, description: 'Corte grátis' },
    { points: 1000, description: 'Pacote VIP mensal' },
  ];

  const availableRewards = rewards.filter((r) => r.points <= loyaltyPoints);

  return (
    <div className={`rounded-lg shadow p-6 ${tier.bgColor}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Programa de Fidelidade</h2>
          <p className="text-gray-600 text-sm">Acumule pontos em cada agendamento</p>
        </div>
        <span className={`text-4xl font-bold ${tier.color}`}>{loyaltyPoints}</span>
      </div>

      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Seu nível</p>
        <p className={`text-2xl font-bold ${tier.color}`}>{tier.name}</p>
        <p className="text-xs text-gray-500 mt-1">
          {tier.name === 'Gold'
            ? 'Parabéns! Você atingiu o nível máximo'
            : tier.name === 'Silver'
              ? `${1000 - loyaltyPoints} pontos para Gold`
              : `${500 - loyaltyPoints} pontos para Silver`}
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Recompensas Disponíveis</p>
        {availableRewards.length > 0 ? (
          <ul className="space-y-2">
            {availableRewards.map((reward, idx) => (
              <li key={idx} className="flex items-center text-sm">
                <span className="text-green-600 mr-2">✓</span>
                <span>{reward.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Agendamentos completados desbloqueiam recompensas</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Próxima meta: <span className="font-semibold">{500 - loyaltyPoints} pontos</span> para Silver
        </p>
      </div>
    </div>
  );
};
