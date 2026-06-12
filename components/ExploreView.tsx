'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink, Plus, X, Search, Loader2, ChevronRight, Settings, Eye, EyeOff } from 'lucide-react';
import type { FeedItem } from '@/app/api/feed/route';

const KW_KEY   = 'jq_explore_keywords';
const CRED_KEY = 'jq_ft_credentials';
const DEFAULT_KEYWORDS = ['ingénieur', 'alternance'];

function loadKeywords(): string[] {
  try { const r = localStorage.getItem(KW_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return DEFAULT_KEYWORDS;
}
function saveKeywords(kw: string[]) {
  try { localStorage.setItem(KW_KEY, JSON.stringify(kw)); } catch { /* */ }
}
function loadCreds(): { clientId: string; clientSecret: string } {
  try { const r = localStorage.getItem(CRED_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return { clientId: '', clientSecret: '' };
}
function saveCreds(c: { clientId: string; clientSecret: string }) {
  try { localStorage.setItem(CRED_KEY, JSON.stringify(c)); } catch { /* */ }
}

function formatAge(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const h = Math.floor((Date.now() - d.getTime()) / 3600000);
  if (h < 1) return 'à l\'instant';
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  return days < 7 ? `il y a ${days}j` : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function ExploreView({ onAddToKanban }: {
  onAddToKanban: (job: Partial<Record<string, string>>) => void;
}) {
  const [keywords, setKeywords]   = useState<string[]>(DEFAULT_KEYWORDS);
  const [creds, setCreds]         = useState({ clientId: '', clientSecret: '' });
  const [newKw, setNewKw]         = useState('');
  const [editingKw, setEditingKw] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [draftCreds, setDraftCreds] = useState({ clientId: '', clientSecret: '' });

  const [items, setItems]       = useState<FeedItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  useEffect(() => {
    setKeywords(loadKeywords());
    const c = loadCreds();
    setCreds(c);
    setDraftCreds(c);
  }, []);

  const query = keywords.join(' ');
  const hasCredentials = !!(creds.clientId && creds.clientSecret);

  const fetchFeed = useCallback(async (force = false) => {
    if (!query.trim() || !creds.clientId || !creds.clientSecret) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        q: query,
        cid: creds.clientId,
        cs: creds.clientSecret,
        ...(force ? { force: '1' } : {}),
      });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      if (data.error === 'NO_CREDENTIALS') { setLoading(false); return; }
      if (data.error === 'INVALID_CREDENTIALS') { setError('Identifiants France Travail invalides. Vérifiez votre Client ID et Secret.'); setLoading(false); return; }
      if (data.error) { setError(data.error); setLoading(false); return; }
      setItems(data.items ?? []);
      setCachedAt(data.cachedAt ?? null);
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [query, creds]);

  useEffect(() => { if (hasCredentials) fetchFeed(); }, [fetchFeed, hasCredentials]);

  function addKeyword() {
    const kw = newKw.trim();
    if (!kw || keywords.includes(kw)) { setNewKw(''); return; }
    const next = [...keywords, kw];
    setKeywords(next);
    saveKeywords(next);
    setNewKw('');
  }
  function removeKeyword(kw: string) {
    const next = keywords.filter(k => k !== kw);
    setKeywords(next);
    saveKeywords(next);
  }
  function saveDraftCreds() {
    setCreds(draftCreds);
    saveCreds(draftCreds);
    setShowConfig(false);
    setError('');
  }

  // ── Écran de configuration ────────────────────────────────
  if (!hasCredentials || showConfig) {
    return (
      <div className="max-w-lg mx-auto pt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">🇫🇷</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Connexion France Travail</h3>
              <p className="text-xs text-gray-500">API officielle, gratuite — inscription en 5 min</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-5 text-sm text-blue-800 space-y-1.5">
            <p className="font-semibold">Comment obtenir vos clés ?</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Allez sur <span className="font-mono bg-blue-100 px-1 rounded">francetravail.io/data/api</span></li>
              <li>Créez un compte (email suffisant)</li>
              <li>Créez une application → activez <strong>«Offres d'emploi v2»</strong></li>
              <li>Copiez le <strong>Client ID</strong> et le <strong>Client Secret</strong></li>
            </ol>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Client ID</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
                placeholder="PAR_xxxxxxxx_xxxx..."
                value={draftCreds.clientId}
                onChange={e => setDraftCreds(p => ({ ...p, clientId: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
                  placeholder="••••••••••••••••"
                  value={draftCreds.clientSecret}
                  onChange={e => setDraftCreds(p => ({ ...p, clientSecret: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            {showConfig && (
              <button onClick={() => setShowConfig(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            )}
            <button
              onClick={saveDraftCreds}
              disabled={!draftCreds.clientId || !draftCreds.clientSecret}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Enregistrer et lancer la recherche
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Les clés sont stockées uniquement dans votre navigateur (localStorage).
          </p>
        </div>
      </div>
    );
  }

  // ── Vue principale ────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header mots-clés */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Search size={16} className="text-violet-500" /> Mots-clés
          </h3>
          <div className="flex items-center gap-2">
            {cachedAt && (
              <span className="text-xs text-gray-400">Mis à jour {formatAge(new Date(cachedAt).toISOString())}</span>
            )}
            <button
              onClick={() => fetchFeed(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Actualiser
            </button>
            <button
              onClick={() => { setDraftCreds(creds); setShowConfig(true); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configurer l'API"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {keywords.map(kw => (
            <span key={kw} className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-xl text-sm font-semibold">
              {kw}
              <button onClick={() => removeKeyword(kw)} className="ml-0.5 hover:text-violet-900"><X size={12} /></button>
            </span>
          ))}
          {editingKw ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                className="border border-violet-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 w-36"
                placeholder="Nouveau mot-clé…"
                value={newKw}
                onChange={e => setNewKw(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addKeyword(); if (e.key === 'Escape') setEditingKw(false); }}
              />
              <button onClick={addKeyword} className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700">OK</button>
              <button onClick={() => setEditingKw(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => setEditingKw(true)}
              className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-violet-200 text-violet-400 rounded-xl text-sm hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              <Plus size={13} /> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">⚠️ {error}</div>
      )}

      {/* Chargement */}
      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-violet-400 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Recherche en cours sur France Travail…</p>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Aucune offre trouvée pour ces mots-clés</p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-violet-700 transition-colors">
                    {item.title}
                  </h4>
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    France Travail
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-2">
                  {item.company  && <span className="font-semibold text-gray-700">{item.company}</span>}
                  {item.location && <span>📍 {item.location}</span>}
                  {item.contract_type && <span className="px-1.5 py-0.5 bg-gray-100 rounded-md">{item.contract_type}</span>}
                  {item.salary   && <span className="text-emerald-600 font-medium">💶 {item.salary}</span>}
                  {item.pubDate  && <span>{formatAge(item.pubDate)}</span>}
                </div>

                {item.summary && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.summary}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ExternalLink size={12} /> Voir l'offre
              </a>
              <button
                onClick={() => onAddToKanban({
                  url:           item.url,
                  title:         item.title,
                  company:       item.company,
                  location:      item.location,
                  salary:        item.salary,
                  contract_type: item.contract_type,
                  summary:       item.summary,
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors"
              >
                <ChevronRight size={13} /> Ajouter au Kanban
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <p className="text-center text-xs text-gray-400 pb-4">
          {items.length} offre{items.length > 1 ? 's' : ''} — source : France Travail
        </p>
      )}
    </div>
  );
}
