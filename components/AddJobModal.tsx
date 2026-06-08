'use client';

import { useState } from 'react';
import { X, Link, Loader2, Sparkles, User, Building2, MapPin, Calendar, DollarSign, Tag } from 'lucide-react';

type JobData = {
  url?: string;
  title?: string;
  company?: string;
  location?: string;
  remote?: string;
  start_date?: string;
  salary?: string;
  contract_type?: string;
  summary?: string;
  contact_name?: string;
  contact_email?: string;
  contact_linkedin?: string;
  network_connection?: string;
  added_by?: string;
  priority?: string;
};

export default function AddJobModal({ onClose, onSave }: { onClose: () => void; onSave: (job: JobData) => Promise<void> }) {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<JobData>({
    url: '', title: '', company: '', location: '', remote: '', start_date: '',
    salary: '', contract_type: '', summary: '', contact_name: '', contact_email: '',
    contact_linkedin: '', network_connection: '', added_by: '', priority: 'medium',
  });

  async function analyze() {
    if (!url.trim()) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.error) { setError(result.error); return; }
      setData({ ...result, added_by: data.added_by, priority: data.priority });
      setAnalyzed(true);
    } catch {
      setError('Erreur réseau');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!data.title || !data.company) { setError('Titre et entreprise requis'); return; }
    setSaving(true);
    await onSave({ ...data, url });
    setSaving(false);
  }

  const field = (label: string, key: keyof JobData, icon: React.ReactNode, placeholder?: string, textarea?: boolean) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1">
        {icon} {label}
      </label>
      {textarea ? (
        <textarea
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 resize-none"
          rows={3}
          placeholder={placeholder}
          value={(data[key] as string) ?? ''}
          onChange={e => setData({ ...data, [key]: e.target.value })}
        />
      ) : (
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
          placeholder={placeholder}
          value={(data[key] as string) ?? ''}
          onChange={e => setData({ ...data, [key]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">✨</span> Nouvelle offre
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* URL Analyzer */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-4">
            <label className="text-xs font-semibold text-violet-700 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles size={12} /> Magie IA — Coller l'URL de l'offre
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-8 pr-3 py-2.5 border border-violet-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  placeholder="https://linkedin.com/jobs/..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyze()}
                />
              </div>
              <button
                onClick={analyze}
                disabled={analyzing || !url.trim()}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {analyzing ? 'Analyse...' : 'Analyser'}
              </button>
            </div>
            {analyzed && (
              <p className="text-xs text-violet-600 mt-2 font-medium">✅ Offre analysée ! Vérifiez et complétez ci-dessous.</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">⚠️ {error}</div>
          )}

          {/* Main fields */}
          <div className="grid grid-cols-2 gap-4">
            {field('Intitulé du poste *', 'title', <Building2 size={12} />, 'Ex: Développeur Full-Stack Senior')}
            {field('Entreprise *', 'company', <Building2 size={12} />, 'Ex: Airbnb')}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {field('Lieu', 'location', <MapPin size={12} />, 'Paris, France')}
            {field('Début', 'start_date', <Calendar size={12} />, 'ASAP / Sept 2025')}
            {field('Salaire', 'salary', <DollarSign size={12} />, '55-65k€')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Contrat</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                value={data.contract_type ?? ''}
                onChange={e => setData({ ...data, contract_type: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'VIE'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Remote</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                value={data.remote ?? ''}
                onChange={e => setData({ ...data, remote: e.target.value })}
              >
                <option value="">— Choisir —</option>
                <option value="full">Full remote 🌍</option>
                <option value="partial">Hybride 🏠/🏢</option>
                <option value="no">Présentiel 🏢</option>
              </select>
            </div>
          </div>

          {field('Résumé IA', 'summary', <Sparkles size={12} />, 'Résumé de l\'offre en 30-50 mots...', true)}

          {/* Contact */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1"><User size={12} /> Contact recruteur</p>
            <div className="grid grid-cols-3 gap-3">
              {field('Nom', 'contact_name', null, 'Sarah Martin')}
              {field('Email', 'contact_email', null, 'sarah@company.com')}
              {field('LinkedIn', 'contact_linkedin', null, 'linkedin.com/in/...')}
            </div>
          </div>

          {field('Connexion réseau 🕸️', 'network_connection', null, 'Ex: Contacter Jean via Alice qui y a travaillé', true)}

          {/* Meta */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Tag size={12} /> Ajouté par
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                placeholder="Prénom du helper"
                value={data.added_by ?? ''}
                onChange={e => setData({ ...data, added_by: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Priorité</label>
              <div className="flex gap-2">
                {[['low', '🌱 Faible'], ['medium', '⚡ Moyen'], ['high', '🔥 Haute']].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setData({ ...data, priority: v })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      data.priority === v
                        ? v === 'high' ? 'bg-red-500 text-white' : v === 'medium' ? 'bg-amber-400 text-white' : 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !data.title || !data.company}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : '🚀'}
              {saving ? 'Sauvegarde...' : 'Ajouter l\'offre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
