'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Erreur');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">JobQuest</h1>
          <p className="text-gray-500 text-sm mt-1">Recherche collaborative</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Lock size={11} /> Mot de passe
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠️ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {loading ? 'Connexion...' : 'Accéder'}
          </button>
        </form>
      </div>
    </div>
  );
}
