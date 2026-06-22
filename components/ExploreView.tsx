'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, ExternalLink, Plus, X, Search, Loader2, ChevronRight, Eye, EyeOff, Ban, MapPin, Check } from 'lucide-react';
import type { FeedItem } from '@/app/api/feed/route';
import { CONTINENTS, countryNameFr, countryNameEn } from '@/lib/regions';

const KW_KEY_LS      = 'jq_explore_keywords';
const COUNTRY_KEY_LS = 'jq_explore_countries';
const DEFAULT_KEYWORDS = ['ingénieur', 'alternance'];
const DEFAULT_COUNTRIES = ['FR'];

/** Zones envoyées à l'API : continent entier (ou quasi) → label continent, sinon pays un à un */
function computeZones(sel: Set<string>): string[] {
  const zones: string[] = [];
  for (const cont of CONTINENTS) {
    const selected = cont.countries.filter(c => sel.has(c));
    if (selected.length === 0) continue;
    if (selected.length === cont.countries.length || selected.length > 6) zones.push(cont.labelEn);
    else zones.push(...selected.map(countryNameEn));
  }
  return zones.slice(0, 8);
}

/** Résumé lisible de la sélection pour le bouton */
function zoneSummary(sel: Set<string>): string {
  const parts: string[] = [];
  for (const cont of CONTINENTS) {
    const selected = cont.countries.filter(c => sel.has(c));
    if (selected.length === 0) continue;
    const missing = cont.countries.length - selected.length;
    if (missing === 0) parts.push(cont.labelFr);
    else if (selected.length <= 3) parts.push(selected.map(countryNameFr).join(', '));
    else if (missing <= 3) parts.push(`${cont.labelFr} sauf ${cont.countries.filter(c => !sel.has(c)).map(countryNameFr).join(', ')}`);
    else parts.push(`${cont.labelFr} (${selected.length} pays)`);
  }
  return parts.join(' · ') || 'Choisir une zone…';
}

function normKey(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

function formatAge(dateStr: string): string {
  if (!dateStr) return '';
  if (/il y a|ago|aujourd|hier/i.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const h = Math.floor((Date.now() - d.getTime()) / 3600000);
  if (h < 1) return 'à l\'instant';
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  return days < 7 ? `il y a ${days}j` : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

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
  'LinkedIn':       'bg-sky-50 text-sky-600',
  'Indeed':         'bg-indigo-50 text-indigo-600',
  'Welcome to the Jungle': 'bg-emerald-50 text-emerald-600',
  'APEC':           'bg-violet-50 text-violet-600',
};

export default function ExploreView({ onAddToKanban, refreshSignal = 0, kanbanSaveSignal = 0, kanbanCancelSignal = 0 }: {
  onAddToKanban: (job: Partial<Record<string, string>>) => void;
  refreshSignal?: number;
  kanbanSaveSignal?: number;
  kanbanCancelSignal?: number;
}) {
  const [keywords, setKeywords]     = useState<string[]>(DEFAULT_KEYWORDS);
  const [countries, setCountries]   = useState<string[]>(DEFAULT_COUNTRIES);
  const [showZones, setShowZones]   = useState(false);
  const [zoneDraft, setZoneDraft]   = useState<Set<string>>(new Set(DEFAULT_COUNTRIES));
  const [newKw, setNewKw]           = useState('');
  const [editingKw, setEditingKw]   = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [includeLinkedin, setIncludeLinkedin] = useState(true);

  const [items, setItems]       = useState<FeedItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [blockCompany, setBlockCompany] = useState<FeedItem | null>(null);
  const [pendingKanbanItem, setPendingKanbanItem] = useState<FeedItem | null>(null);
  const [confirmHideItem, setConfirmHideItem] = useState<FeedItem | null>(null);

  // Signaux Kanban depuis le parent
  const prevSaveSignal = useRef(0);
  const prevCancelSignal = useRef(0);
  useEffect(() => {
    if (kanbanSaveSignal > prevSaveSignal.current && pendingKanbanItem) {
      setHidden(prev => new Set(prev).add(`offer:${normKey(`${pendingKanbanItem.title} ${pendingKanbanItem.company}`)}`));
      setPendingKanbanItem(null);
    }
    prevSaveSignal.current = kanbanSaveSignal;
  }, [kanbanSaveSignal, pendingKanbanItem]);

  useEffect(() => {
    if (kanbanCancelSignal > prevCancelSignal.current && pendingKanbanItem) {
      setConfirmHideItem(pendingKanbanItem);
      setPendingKanbanItem(null);
    }
    prevCancelSignal.current = kanbanCancelSignal;
  }, [kanbanCancelSignal, pendingKanbanItem]);

  // Sauvegarde debounced vers le serveur
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function scheduleSave(kw: string[], co: string[], li?: boolean) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const linkedin = li ?? includeLinkedin;
    saveTimer.current = setTimeout(() => {
      fetch('/api/spaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { keywords: kw, countries: co, linkedin } }),
      }).catch(() => {});
    }, 1500);
  }

  // Chargement initial depuis l'API (settings de l'espace), avec fallback localStorage
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(me => {
        const s = me?.settings ?? {};
        const kw = Array.isArray(s.keywords) && s.keywords.length ? s.keywords : (() => {
          try { const r = localStorage.getItem(KW_KEY_LS); if (r) return JSON.parse(r); } catch { /* */ }
          return DEFAULT_KEYWORDS;
        })();
        const co = Array.isArray(s.countries) && s.countries.length ? s.countries : (() => {
          try { const r = localStorage.getItem(COUNTRY_KEY_LS); if (r) { const a = JSON.parse(r); if (Array.isArray(a) && a.length) return a; } } catch { /* */ }
          return DEFAULT_COUNTRIES;
        })();
        setKeywords(kw);
        setCountries(co);
        setZoneDraft(new Set(co));
        if (s.linkedin === false) setIncludeLinkedin(false);
        setSettingsLoaded(true);
      })
      .catch(() => {
        // Fallback localStorage
        try {
          const kw = localStorage.getItem(KW_KEY_LS);
          if (kw) setKeywords(JSON.parse(kw));
          const co = localStorage.getItem(COUNTRY_KEY_LS);
          if (co) { const a = JSON.parse(co); if (Array.isArray(a) && a.length) { setCountries(a); setZoneDraft(new Set(a)); } }
        } catch { /* */ }
        setSettingsLoaded(true);
      });
  }, []);

  function commitZones() {
    const codes = [...zoneDraft];
    if (codes.length === 0) return;
    setCountries(codes);
    setShowZones(false);
    scheduleSave(keywords, codes);
  }

  async function ignoreOffer(item: FeedItem) {
    setHidden(prev => new Set(prev).add(`offer:${normKey(`${item.title} ${item.company}`)}`));
    try {
      await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'offer', value: `${item.title} ${item.company}`, label: `${item.title} — ${item.company}` }),
      });
    } catch { /* masquage local reste effectif */ }
  }

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
    } catch { /* masquage local reste effectif */ }
  }

  const query = keywords.join(' ');

  const fetchFeed = useCallback(async (force = false) => {
    if (!query.trim() || !settingsLoaded) return;
    setLoading(true);
    setError('');
    setWarnings([]);
    try {
      const selSet = new Set(countries);
      const params = new URLSearchParams({
        q: query,
        zones: computeZones(selSet).join(','),
        sel: countries.join(','),
        linkedin: includeLinkedin ? '1' : '0',
        ...(force ? { force: '1' } : {}),
      });
      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setItems(data.items ?? []);
      setWarnings(data.warnings ?? []);
      setCachedAt(data.cachedAt ?? null);
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [query, countries, settingsLoaded, includeLinkedin]);

  useEffect(() => { fetchFeed(); }, [fetchFeed, refreshSignal]);

  function addKeyword() {
    const kw = newKw.trim();
    if (!kw || keywords.includes(kw)) { setNewKw(''); return; }
    const next = [...keywords, kw];
    setKeywords(next);
    scheduleSave(next, countries);
    setNewKw('');
  }

  function removeKeyword(kw: string) {
    const next = keywords.filter(k => k !== kw);
    setKeywords(next);
    scheduleSave(next, countries);
  }

  const visible = items.filter(i =>
    !hidden.has(`offer:${normKey(`${i.title} ${i.company}`)}`) &&
    !hidden.has(`company:${normKey(i.company)}`)
  );

  return (
    <div className="space-y-5">
      {/* Header mots-clés */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Search size={16} className="text-violet-500" /> Mots-clés
            </h3>
            <button
              onClick={() => { setZoneDraft(new Set(countries)); setShowZones(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 bg-gray-50 transition-colors max-w-sm"
            >
              <MapPin size={14} className="text-violet-500 shrink-0" />
              <span className="truncate">{zoneSummary(new Set(countries))}</span>
            </button>
          </div>
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

        {/* Option LinkedIn */}
        <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-500 hover:text-gray-700">
            <input
              type="checkbox"
              checked={includeLinkedin}
              onChange={e => {
                const val = e.target.checked;
                setIncludeLinkedin(val);
                scheduleSave(keywords, countries, val);
              }}
              className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
            />
            Inclure LinkedIn dans les recherches
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">⚠️ {error}</div>
      )}
      {warnings.map(w => (
        <div key={w} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">⚠️ {w}</div>
      ))}

      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-violet-400 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Recherche en cours…</p>
          </div>
        </div>
      )}

      {!loading && !error && visible.length === 0 && settingsLoaded && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">
            {items.length > 0 ? 'Toutes les offres trouvées ont été ignorées' : 'Aucune offre trouvée pour ces mots-clés'}
          </p>
        </div>
      )}

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
                >
                  <Ban size={13} /> Bloquer l'entreprise
                </button>
              )}
              <button
                onClick={() => ignoreOffer(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <EyeOff size={13} /> Ignorer
              </button>
              <button
                onClick={() => {
                  setPendingKanbanItem(item);
                  onAddToKanban({
                    url:           item.url,
                    title:         item.title,
                    company:       item.company,
                    location:      item.location,
                    salary:        item.salary,
                    contract_type: item.contract_type,
                    summary:       item.summary,
                  });
                }}
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

      {/* Modal : où chercher */}
      {showZones && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-violet-500" /> Où chercher ?
              </h3>
              <button onClick={() => setShowZones(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1">
              {CONTINENTS.map(cont => {
                const selCount = cont.countries.filter(c => zoneDraft.has(c)).length;
                const all = selCount === cont.countries.length;
                return (
                  <div key={cont.id}>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => {
                          const next = new Set(zoneDraft);
                          if (all) cont.countries.forEach(c => next.delete(c));
                          else cont.countries.forEach(c => next.add(c));
                          setZoneDraft(next);
                        }}
                        className="flex items-center gap-2 font-bold text-sm text-gray-800 hover:text-violet-700 transition-colors"
                      >
                        <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          all ? 'bg-violet-600 border-violet-600' : selCount > 0 ? 'bg-violet-200 border-violet-400' : 'border-gray-300'
                        }`}>
                          {all && <Check size={13} className="text-white" />}
                          {!all && selCount > 0 && <span className="w-2 h-2 bg-violet-600 rounded-sm" />}
                        </span>
                        {cont.labelFr}
                      </button>
                      <span className="text-xs text-gray-400">{selCount}/{cont.countries.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cont.countries.map(code => {
                        const on = zoneDraft.has(code);
                        return (
                          <button
                            key={code}
                            onClick={() => {
                              const next = new Set(zoneDraft);
                              if (on) next.delete(code); else next.add(code);
                              setZoneDraft(next);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              on ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {countryNameFr(code)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400 truncate flex-1">
                {zoneDraft.size === 0 ? 'Sélectionnez au moins un pays' : zoneSummary(zoneDraft)}
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowZones(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={commitZones}
                  disabled={zoneDraft.size === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 transition-all"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal : supprimer l'offre des résultats après annulation Kanban */}
      {confirmHideItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">Supprimer cette offre des résultats ?</h3>
            <p className="text-sm text-gray-600 mb-5">
              <strong className="text-gray-900">{confirmHideItem.title}</strong>
              {confirmHideItem.company && <> — {confirmHideItem.company}</>}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmHideItem(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Non
              </button>
              <button
                onClick={() => {
                  setHidden(prev => new Set(prev).add(`offer:${normKey(`${confirmHideItem.title} ${confirmHideItem.company}`)}`));
                  setConfirmHideItem(null);
                }}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation blocage entreprise */}
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
              Plus aucune offre de <strong className="text-gray-900">{blockCompany.company}</strong> ne sera proposée dans votre Explorer.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Ce blocage est propre à votre espace. Vous pourrez le retirer plus tard si besoin.
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
