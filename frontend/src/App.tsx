import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth.store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BarberDashboard } from './pages/BarberDashboard';
import { BookingPage } from './pages/BookingPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoyaltyPage } from './pages/LoyaltyPage';
import { CreateShopPage } from './pages/CreateShopPage';
import { MyShopsPage } from './pages/MyShopsPage';
import { ShopManagementPage } from './pages/ShopManagementPage';

// Create a client for React Query
const queryClient = new QueryClient();

// Extract token from URL BEFORE React Router processes it
function extractTokenFromUrl() {
  if (typeof window === 'undefined') return;

  const search = window.location.search;

  if (search) {
    const params = new URLSearchParams(search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
    }
  }
}

// Call this immediately when the app loads
extractTokenFromUrl();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<OAuthCallbackHandler />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/barber-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <BarberDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Layout>
                  <AppointmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loyalty"
            element={
              <ProtectedRoute>
                <Layout>
                  <LoyaltyPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Shop Management Routes */}
          <Route
            path="/create-shop"
            element={
              <ProtectedRoute>
                <CreateShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shops"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyShopsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shopId"
            element={
              <ProtectedRoute>
                <ShopManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Public Booking Page */}
          <Route
            path="/book"
            element={
              <Layout>
                <BookingPage />
              </Layout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function OAuthCallbackHandler() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);

  // Sync localStorage token with Zustand store
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      setToken(storedToken);
    }
  }, [token, setToken]);

  // If we have a token, go to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // No token, redirect to login
  return <Navigate to="/login" replace />;
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

  // If user is already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = () => {
    // In development, use localhost backend directly
    // In production, use the configured API URL
    const apiUrl = import.meta.env.VITE_API_URL;
    let authUrl: string;

    if (apiUrl) {
      // Production: use the configured API URL
      authUrl = apiUrl.endsWith('/api')
        ? `${apiUrl}/auth/google`
        : `${apiUrl}/api/auth/google`;
    } else {
      // Development: use localhost backend with /api prefix
      authUrl = 'http://localhost:3001/api/auth/google';
    }

    window.location.href = authUrl;
  };

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

            <button onClick={handleGoogleLogin} className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mb-4">
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
