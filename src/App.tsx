/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { api } from './lib/api';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PublicDashboard from './components/PublicDashboard';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function AdminApp() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminMode = localStorage.getItem('adminMode');
    if (adminMode === 'true') {
      setUser({ user: 'admin-mode' });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    localStorage.setItem('adminMode', 'true');
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminMode');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex bg-[var(--color-brand-100)] h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-brand-400)] border-t-transparent animate-spin"></div>
          <p className="mt-4 text-[var(--color-brand-500)] text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
