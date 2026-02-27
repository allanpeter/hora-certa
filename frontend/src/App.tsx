import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { Dashboard } from './pages/Dashboard';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LoginPage() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Hora Certa</h1>
          <p className="text-xl text-gray-300 mb-8">
            Intelligent barber shop management system
          </p>

          <div className="bg-slate-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Faça login para continuar</h2>
            <p className="text-gray-400 mb-6">
              Use sua conta Google para acessar a plataforma
            </p>

            <button className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mb-4">
              Continuar com Google
            </button>

            <p className="text-gray-500 text-sm">
              Backend está rodando. Acesse a documentação em{' '}
              <code className="bg-slate-900 px-2 py-1 rounded">http://localhost:3001/api</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">📅 Agendamentos</h3>
              <p className="text-gray-400 text-sm">Gerenciamento inteligente de agendamentos</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">💳 Pagamentos</h3>
              <p className="text-gray-400 text-sm">PIX e integração com cartão</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">⭐ Fidelidade</h3>
              <p className="text-gray-400 text-sm">Programa de pontos e recompensas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
