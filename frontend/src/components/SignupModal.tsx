import { useState } from 'react';
import api from '../config/api';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Format phone number to Brazilian format: (XX) XXXXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/signup', {
        email,
        password,
        name,
        phone,
      });

      // Account created successfully, show success screen
      setSuccessName(name);
      setShowSuccess(true);
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to create account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setShowSuccess(false);
    setSuccessName('');
    onClose();
  };

  const handleContinue = () => {
    setShowSuccess(false);
    setSuccessName('');
    onClose();
  };

  const isFormValid = email && password && name && password.length >= 8;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-md">
          {showSuccess ? (
            <>
              {/* Success Screen */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Conta Criada com Sucesso!</h2>
                <p className="text-gray-400">
                  Bem-vindo, <span className="font-semibold text-amber-400">{successName}</span>!
                </p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-300 text-sm">
                  Sua conta foi criada com sucesso. Agora você pode acessar o dashboard e começar a usar a plataforma.
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition mb-3"
              >
                Faça seu login
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2 text-gray-400 border border-slate-600 rounded-lg hover:text-white hover:border-slate-500 transition text-sm"
              >
                Fechar
              </button>
            </>
          ) : (
            <>
              {/* Signup Form */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Criar Cadastro</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-950 border border-red-800 rounded-lg p-4 mb-4 flex items-start justify-between gap-3">
                    <p className="text-red-300 text-sm font-medium flex-1">⚠️ {error}</p>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="text-red-400 hover:text-red-300 flex-shrink-0 text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                )}

            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu_email@exemplo.com"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
