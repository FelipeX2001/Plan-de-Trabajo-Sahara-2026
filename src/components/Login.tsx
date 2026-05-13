import { useState, FormEvent } from 'react';
import { api } from '../lib/api';
import { Lock, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLogin({ user: data.user });
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--color-brand-100)] p-4 font-sans text-slate-800">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md border border-slate-200">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-teal-200)] mb-4 shadow-sm">
            <span className="text-white font-black">VIS</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Sahara VIS 2026</h1>
          <p className="mt-2 text-[10px] uppercase text-slate-500 font-bold tracking-widest text-center">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-200 flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 pl-9 text-slate-800 focus:border-[var(--color-accent-teal-200)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-teal-200)] transition-colors text-sm"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 pl-9 text-slate-800 focus:border-[var(--color-accent-teal-200)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-teal-200)] transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent-teal-200)] px-4 py-2.5 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#056064] focus:outline-none transition-all",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

