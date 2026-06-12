'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink, Plus, X, Search, Loader2, ChevronRight, Settings, Eye, EyeOff, Ban } from 'lucide-react';
import type { FeedItem } from '@/app/api/feed/route';

const KW_KEY   = 'jq_explore_keywords';
const CRED_KEY = 'jq_feed_credentials';
const DEFAULT_KEYWORDS = ['ingénieur', 'alternance'];

type Creds = { serpKey: string; clientId: string; clientSecret: string };
const EMPTY_CREDS: Creds = { serpKey: '', clientId: '', clientSecret: '' };

function loadKeywords(): string[] {
  try { const r = localStorage.getItem(KW_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return DEFAULT_KEYWORDS;
}
function saveKeywords(kw: string[]) {
  try { localStorage.setItem(KW_KEY, JSON.stringify(kw)); } catch { /* */ }
}
function loadCreds(): Creds {
  try {
    const r = localStorage.getItem(CRED_KEY);
    if (r) return { ...EMPTY_CREDS, ...JSON.parse(r) };
    // Migration depuis l'ancien format (France Travail seul)
    const old = localStorage.getItem('jq_ft_credentials');
    if (old) return { ...EMPTY_CREDS, ...JSON.parse(old) };
  } catch { /* */ }
  return EMPTY_CREDS;
}
function saveCreds(c: Creds) {
  try { localStorage.setItem(CRED_KEY, JSON.stringify(c)); } catch { /* */ }
}

/** Normalisation identique au serveur (clé stable titre+entreprise / entreprise) */
function normKey(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

function formatAge(dateStr: string): string {
  if (!dateStr) return '';
  // SerpAPI renvoie déjà du relatif ("il y a 3 jours")
  if (/il y a|ago|aujourd|hier/i.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const h = Math.floor((Date.now() - d.getTime()) / 3600000);
  if (h < 1) return 'à l\'instant';
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  return days < 7 ? `il y a ${days}j` : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** Badge de fraîcheur : vert < 24h, ambre < 3j, gris sinon */
function freshnessStyle(item: FeedItem): string {
  const ts = item.postedTs;
  if (!ts) return 'bg-gray-100 text-gray-500';
  const h = (Date.now() - ts) / 3600000;
  if (h < 24) return 'bg-emerald-100 text-emerald-700';
  if (h < 72) return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

const SOURCE_STYLE: Record<string, string> = {
  'France Travail': 'bg-blue-50 text-blue-600',
  'Indeed':         'bg-indigo-50 text-indigo-600',
  'LinkedIn':       'bg-sky-50 text-sky-600',
  'Welcome to the Jungle': 'bg-emerald-50 text-emerald-600',
  'APEC':           'bg-violet-50 text-violet-600',
};

export default function ExploreView({ onAddToKanban, refreshSignal = 0 }: {
  onAddToKanban: (job: Partial<Record<string, string>>) => void;
  refreshSignal?: number;
}) {
  const [keywords, setKeywords]     = useState<string[]>(DEFAULT_KEYWORDS);
  const [creds, setCreds]           = useState<Creds>(EMPTY_CREDS);
  const [newKw, setNewKw]           = useState('');
  const [editingKw, setEditingKw]   = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [draft, setDraft]           = useState<Creds>(EMPTY_CREDS);

  const [items, setItems]       = useState<FeedItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  // null = pas encore su ; true = le serveur n'a aucune clé → écran de config
  const [needsConfig, setNeedsConfig] = useState<boolean | null>(null);
  // Masquage local immédiat en attendant le prochain fetch (la vraie source est la DB serveur)
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  // Entreprise en attente de confirmation de blocage
  const [blockCompany, setBlockCompany] = useState<FeedItem | null>(null);

  useEffect(() => {
    setKeywords(loadKeywords());
    const c = loadCreds();
    setCreds(c);
    setDraft(c);
  }, []);

  /** Bloque une offre précise (pas de confirmation) */
  async function ignoreOffer(item: FeedItem) {
    setHidden(prev => new Set(prev).add(`offer:${normKey(`${item.title} ${item.company}`)}`));
    try {
      await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'offer', value: `${item.title} ${item.company}`, label: `${item.title} — ${item.company}` }),
      });
    } catch { /* le masquage local reste effectif pour cette session */ }
  }

  /** Bloque toutes les offres d'une entreprise (après confirmation) */
  async function confirmBlockCompany() {
    if (!blockCompany) return;
    const company = blockCompany.company;
    setHidden(prev => new Set(prev).add(`company:${normKey(company)}`));
    setBlockCompany(null);
    try {
      await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'company', value: company, label: company }),
      });
    } catch { /* le masquage local reste effectif pour cette session */ }
  }

  const query = keywords.join(' ');

  const fetchFeed = useCallback(async (force = false) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setWarnings([]);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(creds.serpKey ? { serp: creds.serpKey } : {}),
        ...(creds.clientId && creds.clientSecret ? { cid: creds.clientId, cs: creds.clientSecret } : {}),
        ...(force ? { force: '1' } : {}),
      });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      if (data.error === 'NO_CREDENTIALS') { setNeedsConfig(true); setLoading(false); return; }
      setNeedsConfig(false);
      if (data.error) { setError(data.error); setLoading(false); return; }
      setItems(data.items ?? []);
      setWarnings(data.warnings ?? []);
      setCachedAt(data.cachedAt ?? null);
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [query, creds]);

  // refreshSignal : incrémenté par le parent après un ajout au Kanban →
  // refetch (le serveur exclut désormais l'offre ajoutée)
  useEffect(() => { fetchFeed(); }, [fetchFeed, refreshSignal]);

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
  function saveDraft() {
    setCreds(draft);
    saveCreds(draft);
    setShowConfig(false);
    setError('');
  }

  const draftValid = !!(draft.serpKey || (draft.clientId && draft.clientSecret));
  const visible = items.filter(i =>
    !hidden.has(`offer:${normKey(`${i.title} ${i.company}`)}`) &&
    !hidden.has(`company:${normKey(i.company)}`)
  );

  // ── Écran de configuration (uniquement si le serveur n'a aucune clé) ──
  if (needsConfig === true || showConfig) {
    return (
      <div className="max-w-xl mx-auto pt-6 space-y-4">
        {/* SerpAPI / Google Jobs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔍</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Google Jobs <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1">Recommandé</span></h3>
              <p className="text-xs text-gray-500">Agrège Indeed, LinkedIn, WTTJ, APEC… via SerpAPI — 250 recherches/mois gratuites</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Comment obtenir la clé ?</p>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-700">
              <li>Créez un compte gratuit sur <span className="font-mono bg-amber-100 px-1 rounded">serpapi.com</span></li>
              <li>Copiez votre <strong>API Key</strong> depuis le dashboard</li>
            </ol>
          </div>

          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Clé API SerpAPI</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 font-mono"
            placeholder="64 caractères hexadécimaux…"
            value={draft.serpKey}
            onChange={e => setDraft(p => ({ ...p, serpKey: e.target.value.trim() }))}
          />
        </div>

        {/* France Travail */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">🇫🇷</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">France Travail <span className="text-xs font-medium text-gray-400 ml-1">Optionnel</span></h3>
              <p className="text-xs text-gray-500">API officielle illimitée — compte sur francetravail.io/data/api, activez «Offres d'emploi v2»</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Client ID</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
                placeholder="PAR_xxxxxxxx_xxxx…"
                value={draft.clientId}
                onChange={e => setDraft(p => ({ ...p, clientId: e.target.value.trim() }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
                  placeholder="••••••••••••••••"
                  value={draft.clientSecret}
                  onChange={e => setDraft(p => ({ ...p, clientSecret: e.target.value.trim() }))}
                />
                <button type="button" onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {showConfig && (
            <button onClick={() => setShowConfig(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 bg-white transition-colors">
              Annuler
            </button>
          )}
          <button
            onClick={saveDraft}
            disabled={!draftValid}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-lg shadow-violet-200"
          >
            Enregistrer et lancer la recherche
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Une seule source suffit. Les clés sont stockées uniquement dans votre navigateur (localStorage).
        </p>
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
              onClick={() => { setDraft(creds); setShowConfig(true); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configurer les sources"
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
                className="border border-violet-300 rounded-xl px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 w-36"
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

      {/* Erreurs / warnings */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">⚠️ {error}</div>
      )}
      {warnings.map(w => (
        <div key={w} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">⚠️ {w}</div>
      ))}

      {/* Chargement */}
      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-violet-400 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Recherche en cours…</p>
          </div>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">
            {items.length > 0 ? 'Toutes les offres trouvées ont été ignorées' : 'Aucune offre trouvée pour ces mots-clés'}
          </p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {visible.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-violet-700 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.pubDate && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${freshnessStyle(item)}`}>
                        🕐 {formatAge(item.pubDate)}
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_STYLE[item.source] ?? 'bg-gray-100 text-gray-500'}`}>
                      {item.source}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-2">
                  {item.company  && <span className="font-semibold text-gray-700">{item.company}</span>}
                  {item.location && <span>📍 {item.location}</span>}
                  {item.contract_type && <span className="px-1.5 py-0.5 bg-gray-100 rounded-md">{item.contract_type}</span>}
                  {item.salary   && <span className="text-emerald-600 font-medium">💶 {item.salary}</span>}
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
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mr-auto"
              >
                <ExternalLink size={12} /> Voir l'offre
              </a>
              {item.company && (
                <button
                  onClick={() => setBlockCompany(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors"
                  title={`Ne plus proposer les offres de ${item.company}`}
                >
                  <Ban size={13} /> Bloquer l'entreprise
                </button>
              )}
              <button
                onClick={() => ignoreOffer(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Ne plus proposer cette offre"
              >
                <EyeOff size={13} /> Ignorer
              </button>
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

      {visible.length > 0 && (
        <p className="text-center text-xs text-gray-400 pb-4">
          {visible.length} offre{visible.length > 1 ? 's' : ''} de la semaine, triée{visible.length > 1 ? 's' : ''} par date
          {items.length > visible.length && ` · ${items.length - visible.length} masquée${items.length - visible.length > 1 ? 's' : ''}`}
        </p>
      )}

      {/* Modal de confirmation : blocage entreprise */}
      {blockCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Ban size={20} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900">Bloquer cette entreprise ?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Plus aucune offre de <strong className="text-gray-900">{blockCompany.company}</strong> ne sera proposée dans l'onglet Explorer.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Ce blocage s'applique à toute l'équipe. Vous pourrez le retirer plus tard si besoin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBlockCompany(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmBlockCompany}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
              >
                <span className="flex items-center justify-center gap-1.5"><Ban size={14} /> Bloquer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
