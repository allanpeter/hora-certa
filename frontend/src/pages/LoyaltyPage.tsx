import { Card, Badge } from '../components/FormElements';

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  available: boolean;
  claimed: boolean;
}

interface PointTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  type: 'earn' | 'redeem';
}

export const LoyaltyPage = () => {
  // TODO: Integrate with real API endpoints for rewards and transactions
  const rewards: Reward[] = [];
  const transactions: PointTransaction[] = [];
  const totalPoints = 0;
  const nextTier = 500; // Silver tier
  const pointsNeeded = nextTier - totalPoints;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Programa de Fidelidade</h1>
      <p className="text-gray-600 mb-8">Acumule pontos e desbloqueie recompensas exclusivas</p>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Points Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-600">
          <div className="text-center">
            <p className="text-gray-700 text-sm font-medium">Seus Pontos</p>
            <p className="text-5xl font-bold text-blue-600 mt-2">{totalPoints}</p>
            <p className="text-sm text-gray-600 mt-2">Faltam {pointsNeeded} para Silver</p>
            <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(totalPoints / nextTier) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Tier Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-600">
          <div className="text-center">
            <p className="text-gray-700 text-sm font-medium">Seu Nível</p>
            <p className="text-5xl font-bold text-amber-600 mt-2">🥉</p>
            <p className="text-xl font-bold text-amber-800 mt-2">Bronze</p>
            <p className="text-xs text-amber-700 mt-2">0-499 pontos</p>
          </div>
        </Card>

        {/* Benefits Card */}
        <Card>
          <p className="text-gray-700 text-sm font-medium mb-3">Benefícios Bronze</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Desconto em serviços</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Resgates de recompensas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-400">✗</span>
              <span className="text-gray-400">Prioridade de agendamento</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-400">✗</span>
              <span className="text-gray-400">Atendimento VIP</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rewards Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Recompensas Disponíveis</h2>

          {rewards.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-2xl mb-2">🎁</p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Recompensas em breve
              </p>
              <p className="text-gray-600">
                Estamos preparando as recompensas para você
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <Card
                  key={reward.id}
                  className={`cursor-pointer transition ${
                    reward.available ? 'hover:shadow-lg' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{reward.image}</div>
                    <Badge
                      variant={
                        reward.available
                          ? reward.claimed
                            ? 'success'
                            : 'default'
                          : 'warning'
                      }
                    >
                      {!reward.available
                        ? '🔒 Em breve'
                        : reward.claimed
                          ? '✓ Obtido'
                          : `${reward.points} pts`}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{reward.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                  {reward.available && !reward.claimed && (
                    <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                      Resgatar Agora
                    </button>
                  )}

                  {reward.claimed && (
                    <div className="w-full py-2 px-4 bg-green-100 text-green-800 rounded-lg text-center font-medium text-sm">
                      ✓ Desbloqueado
                    </div>
                  )}

                  {!reward.available && (
                    <div className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium text-sm">
                      Em breve
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Histórico de Pontos</h2>

          <Card className="p-0">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">Nenhuma transação ainda</p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <span
                        className={`font-bold ${
                          transaction.type === 'earn'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'earn' ? '+' : '-'}
                        {Math.abs(transaction.points)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <h3 className="font-bold mb-3">Estatísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pontos este mês</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resgates totais</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa média/mês</span>
                <span className="font-bold">-</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Como Funciona</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">1️⃣</div>
            <h3 className="font-bold mb-2">Agende</h3>
            <p className="text-sm text-gray-600">
              Faça um agendamento e receba pontos
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">2️⃣</div>
            <h3 className="font-bold mb-2">Acumule</h3>
            <p className="text-sm text-gray-600">
              Ganhe 1 ponto por real gasto
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">3️⃣</div>
            <h3 className="font-bold mb-2">Suba de Nível</h3>
            <p className="text-sm text-gray-600">
              Desbloqueie novos benefícios
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">4️⃣</div>
            <h3 className="font-bold mb-2">Resgate</h3>
            <p className="text-sm text-gray-600">
              Use seus pontos em recompensas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
