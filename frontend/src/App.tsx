import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Hora Certa</h1>
          <p className="text-xl text-gray-300 mb-8">
            Intelligent barber shop management system
          </p>

          <div className="bg-slate-800 rounded-lg p-8 mb-8">
            <p className="text-gray-400 mb-4">🚧 Application is in development</p>
            <p className="text-gray-500 text-sm">
              Backend is running and API documentation is available at{' '}
              <code className="bg-slate-900 px-2 py-1 rounded">http://localhost:3001/api</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">📅 Schedule</h3>
              <p className="text-gray-400 text-sm">Intelligent appointment management</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">💳 Payments</h3>
              <p className="text-gray-400 text-sm">PIX and card integration</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">⭐ Loyalty</h3>
              <p className="text-gray-400 text-sm">Points-based rewards program</p>
            </div>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            <p>View the PRD.md for complete feature documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
