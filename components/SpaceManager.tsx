'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Trash2, LogOut, Eye, EyeOff, Loader2, Key, Settings } from 'lucide-react';

type SpaceInfo = { id: number; name: string; slug: string };
type MeInfo = { id: number; name: string; slug: string; has_serpapi: boolean; has_ft: boolean; settings: Record<string, unknown> };

interface Props {
  onClose: () => void;
}

export default function SpaceManager({ onClose }: Props) {
  const router = useRouter();
  const [me, setMe] = useState<MeInfo | null>(null);
  const [spaces, setSpaces] = useState<SpaceInfo[]>([]);
  const [view, setView] = useState<'main' | 'create' | 'delete' | 'config'>('main');
  const [deleteTarget, setDeleteTarget] = useState<SpaceInfo | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeletePwd, setShowDeletePwd] = useState(false);

  // Création d'espace
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Config SerpAPI / FT
  const [serpapiKey, setSerpapiKey] = useState('');
  const [ftId, setFtId] = useState('');
  const [ftSecret, setFtSecret] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configOk, setConfigOk] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(setMe).catch(() => {});
    fetch('/api/spaces').then(r => r.json()).then(setSpaces).catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    const res = await fetch('/api/spaces', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget.id, password: deletePassword }),
    });
    const data = await res.json();
    if (res.ok) {
      if (deleteTarget.id === me?.id) {
        router.push('/login');
        router.refresh();
      } else {
        setSpaces(s => s.filter(x => x.id !== deleteTarget.id));
        setView('main');
      }
    } else {
      setDeleteError(data.error ?? 'Erreur');
    }
    setDeleting(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    const slug = newName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), slug, password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setSpaces(s => [...s, data]);
      setView('main');
      setNewName('');
      setNewPassword('');
    } else {
      setCreateError(data.error ?? 'Erreur');
    }
    setCreating(false);
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingConfig(true);
    setConfigOk(false);
    const body: Record<string, string> = {};
    if (serpapiKey !== '') body.serpapi_key = serpapiKey;
    if (ftId !== '') body.ft_client_id = ftId;
    if (ftSecret !== '') body.ft_client_secret = ftSecret;
    const res = await fetch('/api/spaces', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setConfigOk(true);
      setMe(m => m ? { ...m, has_serpapi: !!(serpapiKey || m.has_serpapi), has_ft: !!((ftId || m.has_ft) && (ftSecret || m.has_ft)) } : m);
    }
    setSavingConfig(false);
  }

  const AVATAR_COLORS = [
    'from-violet-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-cyan-600',
  ];
  const spaceColor = (idx: number) => AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const initials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">
            {view === 'main' && 'Mon compte'}
            {view === 'create' && 'Créer un espace'}
            {view === 'delete' && `Supprimer "${deleteTarget?.name}"`}
            {view === 'config' && 'Configuration API'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Vue principale */}
          {view === 'main' && (
            <>
              {/* Espace courant */}
              {me && (
                <div className="bg-violet-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${spaceColor(spaces.findIndex(s => s.id === me.id))} flex items-center justify-center text-white font-bold text-lg shadow`}>
                    {initials(me.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{me.name}</p>
                    <p className="text-xs text-gray-400">Espace actif</p>
                  </div>
                  <div className="flex gap-1">
                    {me.has_serpapi && <span title="SerpAPI configuré" className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">SerpAPI ✓</span>}
                    {me.has_ft && <span title="France Travail configuré" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">FT ✓</span>}
                  </div>
                </div>
              )}

              {/* Actions espace courant */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView('config')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
                >
                  <Key size={15} className="text-violet-500" /> Config API
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut size={15} /> Se déconnecter
                </button>
              </div>

              {/* Autres espaces */}
              {spaces.filter(s => s.id !== me?.id).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Autres espaces</p>
                  <div className="space-y-2">
                    {spaces.filter(s => s.id !== me?.id).map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${spaceColor(spaces.findIndex(x => x.id === s.id))} flex items-center justify-center text-white font-bold text-sm`}>
                          {initials(s.name)}
                        </div>
                        <span className="flex-1 font-semibold text-gray-700 text-sm">{s.name}</span>
                        <button
                          onClick={() => { setDeleteTarget(s); setDeletePassword(''); setDeleteError(''); setView('delete'); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Créer un espace */}
              <button
                onClick={() => setView('create')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-sm font-semibold text-gray-400 hover:text-violet-600 transition-all"
              >
                <Plus size={16} /> Créer un espace
              </button>

              {/* Supprimer son propre espace */}
              {me && (
                <button
                  onClick={() => { setDeleteTarget(me as SpaceInfo); setDeletePassword(''); setDeleteError(''); setView('delete'); }}
                  className="w-full text-xs text-red-400 hover:text-red-600 font-semibold py-1 transition-colors"
                >
                  Supprimer mon espace…
                </button>
              )}
            </>
          )}

          {/* Création d'espace */}
          {view === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Prénom / Nom</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                  placeholder="ex : Sophie"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {createError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠️ {createError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setView('main')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim() || !newPassword}
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Créer
                </button>
              </div>
            </form>
          )}

          {/* Suppression d'espace */}
          {view === 'delete' && deleteTarget && (
            <div className="space-y-4">
              <div className="bg-red-50 rounded-2xl p-4 text-sm text-red-700">
                <p className="font-bold mb-1">⚠️ Action irréversible</p>
                <p>Toutes les données de l'espace <strong>{deleteTarget.name}</strong> seront supprimées définitivement.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Mot de passe de l'espace «{deleteTarget.name}»
                </label>
                <div className="relative">
                  <input
                    type={showDeletePwd ? 'text' : 'password'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-50"
                    placeholder="••••••••"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowDeletePwd(!showDeletePwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showDeletePwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {deleteError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠️ {deleteError}</p>}
              <div className="flex gap-3">
                <button onClick={() => setView('main')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || !deletePassword}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Config API */}
          {view === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <Key size={11} /> Clé SerpAPI {me?.has_serpapi && <span className="text-emerald-500">(configurée)</span>}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 font-mono"
                  placeholder={me?.has_serpapi ? '(laisser vide pour ne pas changer)' : 'Votre clé SerpAPI'}
                  value={serpapiKey}
                  onChange={e => setSerpapiKey(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  France Travail — Client ID {me?.has_ft && <span className="text-emerald-500">(configuré)</span>}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 font-mono"
                  placeholder={me?.has_ft ? '(laisser vide pour ne pas changer)' : 'Client ID'}
                  value={ftId}
                  onChange={e => setFtId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">France Travail — Client Secret</label>
                <input
                  type="password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 font-mono"
                  placeholder={me?.has_ft ? '(laisser vide pour ne pas changer)' : 'Client Secret'}
                  value={ftSecret}
                  onChange={e => setFtSecret(e.target.value)}
                />
              </div>
              {configOk && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">✓ Configuration sauvegardée</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setView('main')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={savingConfig || (!serpapiKey && !ftId && !ftSecret)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />} Sauvegarder
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
