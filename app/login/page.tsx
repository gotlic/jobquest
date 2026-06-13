'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, Plus, ChevronRight } from 'lucide-react';

type SpaceInfo = { id: number; name: string; slug: string };

export default function LoginPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<SpaceInfo[]>([]);
  const [selected, setSelected] = useState<SpaceInfo | null>(null);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/spaces').then(r => r.json()).then(setSpaces).catch(() => {});
  }, []);

  function selectSpace(s: SpaceInfo) {
    setSelected(s);
    setPassword('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selected.slug, password }),
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

  const initials = (name: string) => name.slice(0, 2).toUpperCase();
  const AVATAR_COLORS = [
    'from-violet-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-cyan-600',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">JobQuest</h1>
          <p className="text-gray-500 text-sm mt-1">Choisissez votre espace</p>
        </div>

        {!selected ? (
          /* Sélection de l'espace */
          <div className="space-y-3">
            {spaces.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-violet-400" />
              </div>
            )}
            {spaces.map((s, i) => (
              <button
                key={s.id}
                onClick={() => selectSpace(s)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  {initials(s.name)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">Espace personnel</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-violet-400 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          /* Saisie du mot de passe */
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 font-semibold mb-2"
            >
              ← Changer d'espace
            </button>

            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[spaces.findIndex(s => s.id === selected.id) % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold shadow`}>
                {initials(selected.name)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-400">Entrez votre mot de passe</p>
              </div>
            </div>

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
        )}
      </div>
    </div>
  );
}
