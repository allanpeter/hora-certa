import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useProfile } from '../hooks/useProfile';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  requiresAuth: boolean;
  requiresOwner?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊', requiresAuth: true },
  { path: '/appointments', label: 'Meus Agendamentos', icon: '📅', requiresAuth: true },
  { path: '/book', label: 'Agendar', icon: '✨', requiresAuth: false },
  { path: '/loyalty', label: 'Fidelidade', icon: '⭐', requiresAuth: true },
  { path: '/shops', label: 'Gerenciar Barbearia', icon: '💈', requiresAuth: true, requiresOwner: true },
  { path: '/settings', label: 'Configurações', icon: '⚙️', requiresAuth: true },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuthStore();
  const { data: profile } = useProfile();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 md:hidden">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">Hora Certa</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="bg-gray-50 border-t border-gray-200">
            <div className="space-y-1 px-4 py-2">
              {navItems
                .filter((item) => (!item.requiresAuth || token) && (!item.requiresOwner || profile?.user_type === 'OWNER'))
                .map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left px-4 py-3 rounded transition ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              {token && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <span className="mr-2">🚪</span>
                  Sair
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-white shadow-sm flex-col border-r border-gray-200">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900">Hora Certa</h1>
            <p className="text-sm text-gray-500 mt-1">Seu barbeiro em primeiro lugar</p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems
              .filter((item) => (!item.requiresAuth || token) && (!item.requiresOwner || profile?.user_type === 'OWNER'))
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
          </nav>

          {token && (
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm font-medium"
              >
                🚪 Sair
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full md:min-h-screen">
          <div className="container mx-auto px-4 py-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
