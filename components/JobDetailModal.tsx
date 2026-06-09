'use client';

import { useState } from 'react';
import { X, ExternalLink, MapPin, Calendar, DollarSign, User, Mail, Network, Clock, Send, Trash2, Archive, Pencil } from 'lucide-react';
import { LocationTooltip } from '@/components/LocationTooltip';
import { Job, Activity } from '@/lib/db';
import AddJobModal from '@/components/AddJobModal';

type JobWithActivities = Job & { activities: Activity[] };

const STATUS_FLOW = [
  { key: 'todo',      label: '📋 À explorer', color: 'bg-gray-100 text-gray-700' },
  { key: 'ready',     label: '✏️ À postuler', color: 'bg-blue-100 text-blue-700' },
  { key: 'applied',   label: '🚀 Postulé',    color: 'bg-violet-100 text-violet-700' },
  { key: 'followup',  label: '📣 Relancé',    color: 'bg-pink-100 text-pink-700' },
  { key: 'interview', label: '🤝 Entretien',  color: 'bg-amber-100 text-amber-700' },
  { key: 'offer',     label: '🎉 Offre !',    color: 'bg-emerald-100 text-emerald-700' },
  { key: 'rejected',  label: '😔 Refus',      color: 'bg-red-100 text-red-700' },
];

const ACTIVITY_ICONS: Record<string, string> = {
  added: '✨', status: '🔄', note: '💬', default: '📌',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function JobDetailModal({
  job: initialJob,
  onClose,
  onUpdate,
  onDelete,
}: {
  job: JobWithActivities;
  onClose: () => void;
  onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [job, setJob] = useState(initialJob);
  const [showEdit, setShowEdit] = useState(false);
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [appliedDate, setAppliedDate] = useState(job.applied_date ?? new Date().toISOString().split('T')[0]);
  const [responseNotes, setResponseNotes] = useState(job.response_notes ?? '');
  const [networkConnection, setNetworkConnection] = useState(job.network_connection ?? '');
  const [editingNetwork, setEditingNetwork] = useState(false);

  // Helper: refresh job data locally without going through parent (avoids race condition)
  async function refreshJob() {
    const updated = await fetch(`/api/jobs/${job.id}`).then(r => r.json());
    setJob(updated);
    return updated;
  }

  async function updateStatus(status: string) {
    setSaving(true);
    // Directly call API to avoid parent re-render race condition
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, author }),
    });
    await refreshJob();
    setSaving(false);
  }

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, author: author || 'Équipe' }),
    });
    await refreshJob();
    setNote('');
    setSaving(false);
  }

  async function saveAppliedDate() {
    const dateToSave = appliedDate || new Date().toISOString().split('T')[0];
    setAppliedDate(dateToSave);
    const updates: Record<string, unknown> = { applied_date: dateToSave };
    if (job.status === 'todo' || job.status === 'ready') updates.status = 'applied';
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await refreshJob();
  }

  async function saveResponseNotes() {
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response_notes: responseNotes }),
    });
  }

  async function saveNetworkConnection() {
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network_connection: networkConnection }),
    });
    await refreshJob();
    setEditingNetwork(false);
  }

  const currentStatus = STATUS_FLOW.find(s => s.key === job.status) ?? STATUS_FLOW[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{job.title}</h2>
              <p className="text-lg text-gray-500 font-semibold">{job.company}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-colors">
                  <ExternalLink size={16} />
                </a>
              )}
              <button
                onClick={() => setShowEdit(true)}
                title="Modifier l'offre"
                className="p-2 bg-indigo-50 text-indigo-500 rounded-full hover:bg-indigo-100 transition-colors"
              >
                <Pencil size={16} />
              </button>
              {job.status !== 'archived' ? (
                <button
                  onClick={async () => {
                    await fetch(`/api/jobs/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) });
                    await refreshJob();
                  }}
                  title="Archiver cette offre"
                  className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Archive size={16} />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await fetch(`/api/jobs/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'todo' }) });
                    await refreshJob();
                  }}
                  title="Désarchiver"
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <Archive size={12} /> Archivé — Restaurer
                </button>
              )}
              <button
                onClick={() => setShowDelete(true)}
                className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex gap-1.5 mt-4 overflow-x-auto py-1.5 px-0.5">
            {STATUS_FLOW.map(s => (
              <button
                key={s.key}
                onClick={() => updateStatus(s.key)}
                disabled={saving}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  job.status === s.key
                    ? s.color + ' ring-2 ring-violet-400 shadow-md'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Left column */}
          <div className="col-span-2 space-y-5">
            {/* Summary */}
            {job.summary && (
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">✨ Résumé IA</p>
                <p className="text-sm text-gray-700 leading-relaxed">{job.summary}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {job.location && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={14} />Lieu</p>
                  <p className="text-sm font-semibold text-gray-800">
                    <LocationTooltip location={job.location}>
                      <span className="underline decoration-dotted cursor-help">{job.location}</span>
                    </LocationTooltip>
                  </p>
                </div>
              )}
              {[
                { icon: <Calendar size={14} />, label: 'Début', value: job.start_date },
                { icon: <DollarSign size={14} />, label: 'Salaire', value: job.salary },
                { icon: null, label: 'Contrat', value: job.contract_type },
                { icon: <User size={14} />, label: 'Ajouté par', value: job.added_by },
              ].filter(d => d.value).map(d => (
                <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">{d.icon}{d.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{d.value}</p>
                </div>
              ))}
            </div>

            {/* Contact */}
            {(job.contact_name || job.contact_email || job.contact_linkedin) && (
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <User size={12} /> Contact recruteur
                </p>
                <div className="space-y-2">
                  {job.contact_name && <p className="text-sm font-semibold text-gray-800">{job.contact_name}</p>}
                  {job.contact_email && (
                    <a href={`mailto:${job.contact_email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <Mail size={12} /> {job.contact_email}
                    </a>
                  )}
                  {job.contact_linkedin && (
                    <a href={job.contact_linkedin.startsWith('http') ? job.contact_linkedin : `https://${job.contact_linkedin}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      🔗 LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Network — toujours affiché, éditable */}
            <div className="bg-emerald-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <Network size={12} /> Connexion réseau
                </p>
                <button
                  onClick={() => setEditingNetwork(!editingNetwork)}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  {editingNetwork ? 'Annuler' : '✏️ Modifier'}
                </button>
              </div>
              {editingNetwork ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    className="w-full border border-emerald-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                    value={networkConnection}
                    onChange={e => setNetworkConnection(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={saveNetworkConnection}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  {job.network_connection || <span className="text-gray-400 italic">Aucune connexion réseau — cliquez sur Modifier</span>}
                </p>
              )}
            </div>

            {/* Applied date */}
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Send size={12} /> Candidature
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={appliedDate}
                  onChange={e => setAppliedDate(e.target.value)}
                />
                <button
                  onClick={saveAppliedDate}
                  className="px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                >
                  Sauver
                </button>
              </div>
            </div>

            {/* Response notes */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">📩 Réponse de l'entreprise</p>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                placeholder="Notes sur la réponse reçue..."
                value={responseNotes}
                onChange={e => setResponseNotes(e.target.value)}
                onBlur={saveResponseNotes}
              />
            </div>
          </div>

          {/* Right column - Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suivi</p>
            </div>

            {/* Add note */}
            <div className="space-y-2">
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                placeholder="Votre prénom..."
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
              <div className="flex gap-1.5">
                <textarea
                  rows={2}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 resize-none"
                  placeholder="Ajouter une note..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button
                  onClick={addNote}
                  disabled={!note.trim()}
                  className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors self-end"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {[...job.activities].reverse().map(a => (
                <div key={a.id} className="flex gap-2 group rounded-xl hover:bg-gray-50 px-2 py-1.5 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {ACTIVITY_ICONS[a.type] ?? ACTIVITY_ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.author} · {formatDate(a.created_at)}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/activities/${a.id}`, { method: 'DELETE' });
                      await refreshJob();
                    }}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all self-start mt-0.5"
                    title="Supprimer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {job.activities.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Aucune activité</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <AddJobModal
          editJob={{ ...job, id: job.id }}
          onClose={() => setShowEdit(false)}
          onUpdate={async (id, data) => {
            await fetch(`/api/jobs/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            await refreshJob();
            setShowEdit(false);
          }}
        />
      )}

      {/* Delete confirm */}
      {showDelete && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs mx-4">
            <p className="text-4xl mb-3">🗑️</p>
            <p className="font-bold text-gray-900 mb-1">Supprimer cette offre ?</p>
            <p className="text-sm text-gray-500 mb-4">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2 border rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => onDelete(job.id)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
