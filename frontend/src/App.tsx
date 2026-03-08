import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import api from './config/api';
import { SignupModal } from './components/SignupModal';

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
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    let authUrl: string;

    if (apiUrl) {
      authUrl = apiUrl.endsWith('/api')
        ? `${apiUrl}/auth/google`
        : `${apiUrl}/api/auth/google`;
    } else {
      authUrl = 'http://localhost:3001/api/auth/google';
    }

    window.location.href = authUrl;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password: senha,
      });

      const { access_token, user } = response.data;
      setToken(access_token);
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.user_type,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Email ou senha inválidos.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4">
              <span className="text-2xl">✂️</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Hora Certa</h1>
            <p className="text-gray-400">Gerenciamento inteligente para barbearias</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            {/* Error Message - Top of card */}
            {error && (
              <div className="bg-red-950 border-2 border-red-700 rounded-lg p-4 mb-6 flex items-start justify-between gap-3 animate-pulse">
                <div className="flex-1">
                  <p className="text-red-300 text-sm font-semibold">⚠️ Erro ao fazer login</p>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300 flex-shrink-0 text-xl leading-none"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu_email@exemplo.com"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-300">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    {showPassword ? '🙈 Ocultar' : '👁️ Mostrar'}
                  </button>
                </div>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !senha}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Forgot Password & Sign Up Links */}
            <div className="flex items-center justify-between text-sm mb-6">
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement forgot password flow
                  alert('Recuperação de senha em breve');
                }}
                className="text-amber-400 hover:text-amber-300 transition"
              >
                Esqueceu a senha?
              </button>
              <button
                type="button"
                onClick={() => setShowSignupModal(true)}
                className="text-amber-400 hover:text-amber-300 transition"
              >
                Crie seu cadastro
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-gray-500 text-sm">ou</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.91 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              Continuar com Google
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Plataforma segura para gerenciar sua barbearia
          </p>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </>
  );
}

export default App;
