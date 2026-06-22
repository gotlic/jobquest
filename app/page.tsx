'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Plus, LayoutGrid, BarChart3, Search, RefreshCw, User, Telescope, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Job, Activity } from '@/lib/db';
import SpaceManager from '@/components/SpaceManager';
import JobCard from '@/components/JobCard';
import AddJobModal from '@/components/AddJobModal';
import JobDetailModal from '@/components/JobDetailModal';
import ExploreView from '@/components/ExploreView';
const JobsMap = lazy(() => import('@/components/JobsMap'));

type JobWithActivities = Job & { activities: Activity[] };

const COLUMNS = [
  { key: 'todo', emoji: '📋', label: 'À explorer', color: 'from-gray-100 to-gray-50', dot: 'bg-gray-400', count_color: 'text-gray-500' },
  { key: 'applied', emoji: '🚀', label: 'Postulé', color: 'from-violet-100 to-violet-50', dot: 'bg-violet-500', count_color: 'text-violet-600' },
  { key: 'followup', emoji: '📣', label: 'Relancé', color: 'from-pink-100 to-pink-50', dot: 'bg-pink-400', count_color: 'text-pink-600' },
  { key: 'interview', emoji: '🤝', label: 'Entretien', color: 'from-amber-100 to-amber-50', dot: 'bg-amber-400', count_color: 'text-amber-600' },
  { key: 'offer', emoji: '🎉', label: 'Offre !', color: 'from-emerald-100 to-emerald-50', dot: 'bg-emerald-500', count_color: 'text-emerald-600' },
  { key: 'rejected', emoji: '😔', label: 'Refus', color: 'from-red-100 to-red-50', dot: 'bg-red-400', count_color: 'text-red-600' },
];

const STAT_CARDS = [
  { label: 'Total offres', emoji: '📊', keys: ['todo', 'applied', 'interview', 'offer', 'rejected', 'archived'], color: 'from-violet-500 to-indigo-600' },
  { label: 'En cours', emoji: '⚡', keys: ['todo', 'applied', 'interview'], color: 'from-amber-400 to-orange-500' },
  { label: 'Entretiens', emoji: '🤝', keys: ['interview'], color: 'from-blue-500 to-cyan-500' },
  { label: 'Offres reçues', emoji: '🎉', keys: ['offer'], color: 'from-emerald-400 to-teal-500' },
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithActivities | null>(null);
  const [view, setView] = useState<'kanban' | 'stats' | 'explore'>('kanban');
  const [exploreJob, setExploreJob] = useState<Record<string, string> | null>(null);
  const [exploreRefresh, setExploreRefresh] = useState(0);
  const [kanbanSaveSignal, setKanbanSaveSignal] = useState(0);
  const [kanbanCancelSignal, setKanbanCancelSignal] = useState(0);
  const [search, setSearch] = useState('');
  const [showSpaceManager, setShowSpaceManager] = useState(false);
  const [spaceName, setSpaceName] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;
      const data = await res.json();
      setJobs(data);
    } catch { /* réseau indisponible */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => { if (d?.name) setSpaceName(d.name); }).catch(() => {});
  }, []);

  async function handleAddJob(jobData: Record<string, unknown>) {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!res.ok) { console.error('POST /api/jobs failed', res.status); }
    } catch (e) { console.error('POST /api/jobs error', e); }
    await loadJobs();
    setShowAdd(false);
  }

  async function handleOpenJob(job: Job) {
    try {
      const res = await fetch(`/api/jobs/${job.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedJob(data);
    } catch (e) { console.error('handleOpenJob error', e); }
  }

  async function handleUpdateJob(id: number, data: Record<string, unknown>) {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await loadJobs();
    } catch (e) { console.error('handleUpdateJob error', e); }
  }

  async function handleDeleteJob(id: number) {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    setSelectedJob(null);
    await loadJobs();
  }

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const filtered = jobs.filter(j =>
    !search || norm(`${j.title} ${j.company} ${j.location}`).includes(norm(search))
  );

  const byStatus = (key: string) => filtered.filter(j => j.status === key);

  const stats = STAT_CARDS.map(s => ({
    ...s,
    count: jobs.filter(j => s.keys.includes(j.status)).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">JobQuest</h1>
              <p className="text-xs text-gray-400 font-medium">Recherche collaborative</p>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
                placeholder="Rechercher poste, entreprise, lieu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${view === 'kanban' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid size={14} /> Kanban
              </button>
              <button
                onClick={() => setView('stats')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${view === 'stats' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart3 size={14} /> Stats
              </button>
              <button
                onClick={() => setView('explore')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${view === 'explore' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Telescope size={14} /> Explorer
              </button>
            </div>
            <button
              onClick={() => setShowSpaceManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <UserCircle size={14} />
              {spaceName ?? 'Compte'}
            </button>
            <Link
              href="/candidat"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <User size={14} /> Zone Candidat
            </Link>
            <button
              onClick={loadJobs}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200"
            >
              <Plus size={16} /> Ajouter une offre
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black">{s.count}</p>
                  <p className="text-sm font-medium opacity-90 mt-0.5">{s.label}</p>
                </div>
                <span className="text-3xl opacity-80">{s.emoji}</span>
              </div>
            </div>
          ))}
        </div>

        {view === 'kanban' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Chargement...</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map(col => {
                  const colJobs = byStatus(col.key);
                  return (
                    <div key={col.key} className="flex-shrink-0 w-72">
                      <div className={`bg-gradient-to-b ${col.color} rounded-2xl p-3 min-h-32`}>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm leading-none">{col.emoji}</span>
                            <span className="text-sm font-bold text-gray-700 truncate">{col.label}</span>
                          </div>
                          <span className={`text-sm font-black ${col.count_color} flex-shrink-0 ml-1`}>{colJobs.length}</span>
                        </div>
                        <div className="space-y-2">
                          {colJobs.map(job => (
                            <JobCard key={job.id} job={job} onClick={() => handleOpenJob(job)} />
                          ))}
                          {colJobs.length === 0 && (
                            <div className="text-center py-6 text-gray-300 text-sm">
                              <p className="text-2xl mb-1">○</p>
                              Aucune offre
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-6">
            {/* Ligne 1 : Tunnel + Contributeurs */}
            <div className="grid grid-cols-2 gap-6">
              {/* Tunnel */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔽</span> Tunnel de candidature
                </h3>
                <div className="space-y-3">
                  {COLUMNS.map((col) => {
                    const count = jobs.filter(j => j.status === col.key).length;
                    const max = Math.max(...COLUMNS.map(c => jobs.filter(j => j.status === c.key).length), 1);
                    const width = count === 0 ? 0 : Math.round((count / max) * 100);
                    return (
                      <div key={col.key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-28 text-right shrink-0">{col.emoji} {col.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${col.dot} transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${width}%`, minWidth: count > 0 ? '2rem' : '0' }}
                          >
                            {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contributeurs */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👥</span> Offres par contributeur
                </h3>
                {(() => {
                  const byHelper: Record<string, number> = {};
                  jobs.forEach(j => { byHelper[j.added_by] = (byHelper[j.added_by] ?? 0) + 1; });
                  const sorted = Object.entries(byHelper).sort((a, b) => b[1] - a[1]);
                  const max = sorted[0]?.[1] ?? 1;
                  const colors = ['bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500', 'bg-emerald-500'];
                  return (
                    <div className="space-y-3">
                      {sorted.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>}
                      {sorted.map(([name, count], i) => (
                        <div key={name} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-700">{name}</span>
                              <span className="text-sm font-bold text-gray-500">{count}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${colors[i % colors.length]} transition-all`} style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Ligne 2 : Carte de France */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🗺️</span> Carte des offres
              </h3>
              <Suspense fallback={
                <div className="h-[480px] flex items-center justify-center bg-gray-50 rounded-2xl text-sm text-gray-400">
                  Chargement de la carte…
                </div>
              }>
                <JobsMap jobs={jobs} />
              </Suspense>
            </div>

            {/* Ligne 3 : Dernières offres */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>⚡</span> Dernières offres ajoutées
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {jobs.slice(0, 8).map(j => (
                  <div
                    key={j.id}
                    onClick={() => handleOpenJob(j)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-violet-50 cursor-pointer transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {j.company.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-violet-700">{j.title}</p>
                      <p className="text-xs text-gray-500 truncate">{j.company}</p>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p className="col-span-4 text-center text-gray-400 text-sm py-6">Aucune offre pour l'instant</p>
                )}
              </div>
            </div>
          </div>
        )}
        {view === 'explore' && (
          <ExploreView
            onAddToKanban={(job) => setExploreJob(job as Record<string, string>)}
            refreshSignal={exploreRefresh}
            kanbanSaveSignal={kanbanSaveSignal}
            kanbanCancelSignal={kanbanCancelSignal}
          />
        )}
      </main>

      {/* Empty state */}
      {!loading && jobs.length === 0 && view === 'kanban' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{zIndex: 1}}>
          <div className="text-center pointer-events-auto">
            <p className="text-6xl mb-4">🎯</p>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Commencez votre quête !</h2>
            <p className="text-gray-500 mb-6 max-w-xs">Ajoutez la première offre d'emploi. Vos aides peuvent en ajouter aussi !</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200"
            >
              + Ajouter une offre
            </button>
          </div>
        </div>
      )}

      {exploreJob && (
        <AddJobModal
          onClose={() => { setExploreJob(null); setKanbanCancelSignal(n => n + 1); }}
          onSave={async (job) => { await handleAddJob(job); setExploreJob(null); setKanbanSaveSignal(n => n + 1); setExploreRefresh(n => n + 1); }}
          editJob={exploreJob as Parameters<typeof AddJobModal>[0]['editJob']}
        />
      )}

      {showAdd && (
        <AddJobModal onClose={() => setShowAdd(false)} onSave={handleAddJob} />
      )}

      {showSpaceManager && <SpaceManager onClose={() => setShowSpaceManager(false)} />}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={async (id, data) => {
            try {
              await handleUpdateJob(id, data);
              const res = await fetch(`/api/jobs/${id}`);
              if (res.ok) setSelectedJob(await res.json());
            } catch (e) { console.error('onUpdate error', e); }
          }}
          onDelete={handleDeleteJob}
        />
      )}
    </div>
  );
}
