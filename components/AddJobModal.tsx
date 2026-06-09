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

export default function AddJobModal({
  onClose,
  onSave,
  editJob,
  onUpdate,
}: {
  onClose: () => void;
  onSave?: (job: JobData) => Promise<void>;
  editJob?: JobData & { id?: number };
  onUpdate?: (id: number, job: JobData) => Promise<void>;
}) {
  const isEdit = !!editJob;
  const [url, setUrl] = useState(editJob?.url ?? '');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzed, setAnalyzed] = useState<false | 'fresh' | 'cached'>(false);
  const [error, setError] = useState('');
  const [duplicate, setDuplicate] = useState<{ job: Record<string, unknown>; score: number; reason: string } | null>(null);
  const [spaDetected, setSpaDetected] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [data, setData] = useState<JobData>(
    isEdit ? { ...editJob } : {
      url: '', title: '', company: '', location: '', remote: '', start_date: '',
      salary: '', contract_type: '', summary: '', contact_name: '', contact_email: '',
      contact_linkedin: '', network_connection: '', added_by: '', priority: 'medium',
    }
  );

  async function analyze() {
    if (!url.trim()) return;
    setAnalyzing(true);
    setError('');
    setSpaDetected(false);
    try {
      const body: Record<string, string> = { url };
      if (pastedText.trim()) body.text = pastedText.trim();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) {
        setError('Erreur réseau');
        return;
      }

      // Lire la réponse SSE pour garder la connexion active pendant l'appel IA
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result: Record<string, unknown> | null = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(line.slice(6));
              if (chunk._spa) { setSpaDetected(true); setAnalyzing(false); return; }
              if (chunk.done) result = chunk;
              else if (chunk.error) { setError(chunk.error); return; }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      if (!result) { setError('Réponse incomplète'); return; }
      // Whitelist des champs autorisés depuis l'IA (network_connection est exclu)
      setData(prev => ({
        ...prev,
        url: (result!.url as string) ?? prev.url,
        title: (result!.title as string) ?? prev.title,
        company: (result!.company as string) ?? prev.company,
        location: (result!.location as string) ?? prev.location,
        remote: (result!.remote as string) ?? prev.remote,
        start_date: (result!.start_date as string) ?? prev.start_date,
        salary: (result!.salary as string) ?? prev.salary,
        contract_type: (result!.contract_type as string) ?? prev.contract_type,
        summary: (result!.summary as string) ?? prev.summary,
        contact_name: (result!.contact_name as string) ?? prev.contact_name,
        contact_email: (result!.contact_email as string) ?? prev.contact_email,
        contact_linkedin: (result!.contact_linkedin as string) ?? prev.contact_linkedin,
        // network_connection : laissé intact (zone libre des helpers)
      }));
      setAnalyzed(result._cached ? 'cached' : 'fresh');
    } catch {
      setError('Erreur réseau');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave(force = false) {
    if (!data.title || !data.company) { setError('Titre et entreprise requis'); return; }
    setSaving(true);
    setDuplicate(null);
    try {
      if (isEdit && onUpdate && editJob?.id) {
        await onUpdate(editJob.id, { ...data, url });
      } else if (onSave) {
        await onSave({ ...data, url, ...(force ? { _force: true } : {}) } as JobData & { _force?: boolean });
      }
    } catch (e) {
      console.error('handleSave error', e);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function checkDuplicateThenSave() {
    if (!data.title || !data.company) { setError('Titre et entreprise requis'); return; }
    if (isEdit) { await handleSave(); return; }
    setSaving(true);
    setDuplicate(null);
    try {
      // Vérifie les doublons SANS insérer
      const res = await fetch('/api/jobs/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: data.title, company: data.company, location: data.location, url }),
      });
      if (res.status === 409) {
        const body = await res.json();
        setDuplicate({ job: body.duplicate, score: body.score, reason: body.reason ?? 'content' });
        setSaving(false);
        return;
      }
      // Pas de doublon → insertion via le flux normal
      await handleSave();
    } catch (e) {
      console.error('checkDuplicateThenSave error', e);
      setError('Erreur lors de la sauvegarde');
      setSaving(false);
    }
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
          onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
        />
      ) : (
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
          placeholder={placeholder}
          value={(data[key] as string) ?? ''}
          onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">{isEdit ? '✏️' : '✨'}</span> {isEdit ? 'Modifier l\'offre' : 'Nouvelle offre'}
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
            {analyzed === 'fresh' && (
              <p className="text-xs text-violet-600 mt-2 font-medium">✅ Offre analysée par l'IA ! Vérifiez et complétez ci-dessous.</p>
            )}
            {analyzed === 'cached' && (
              <p className="text-xs text-emerald-600 mt-2 font-medium">⚡ Résultat depuis le cache — aucun crédit utilisé.</p>
            )}
            {spaDetected && (
              <div className="mt-3">
                <p className="text-xs text-amber-700 font-semibold mb-2">
                  ⚠️ Cette page utilise JavaScript — le contenu n'est pas accessible automatiquement.<br />
                  <span className="font-normal">Copiez le texte de l'offre depuis la page et collez-le ci-dessous, puis cliquez à nouveau sur Analyser.</span>
                </p>
                <textarea
                  className="w-full border border-amber-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50 resize-none"
                  rows={6}
                  placeholder="Coller ici le texte complet de l'offre d'emploi…"
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">⚠️ {error}</div>
          )}

          {/* Main fields */}
          <div className="grid grid-cols-2 gap-4">
            {field('Intitulé du poste *', 'title', <Building2 size={12} />, 'Intitulé du poste')}
            {field('Entreprise *', 'company', <Building2 size={12} />, 'Entreprise')}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {field('Lieu', 'location', <MapPin size={12} />)}
            {field('Début', 'start_date', <Calendar size={12} />)}
            {field('Salaire', 'salary', <DollarSign size={12} />)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Contrat</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                value={data.contract_type ?? ''}
                onChange={e => setData(prev => ({ ...prev, contract_type: e.target.value }))}
              >
                <option value="">— Choisir —</option>
                {['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'VIE'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {field('Résumé IA', 'summary', <Sparkles size={12} />, 'Résumé de l\'offre en 30-50 mots...', true)}

          {/* Contact */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1"><User size={12} /> Contact recruteur</p>
            <div className="grid grid-cols-3 gap-3">
              {field('Nom', 'contact_name', null)}
              {field('Email', 'contact_email', null)}
              {field('LinkedIn', 'contact_linkedin', null)}
            </div>
          </div>

          {field('Connexion réseau 🕸️', 'network_connection', null, undefined, true)}

          {/* Meta */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Tag size={12} /> Ajouté par
              </label>
              <div className="flex gap-1.5 mb-1.5">
                {['Victor', 'Sophie', 'Gautier'].map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setData(prev => ({ ...prev, added_by: prev.added_by === name ? '' : name }))}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      data.added_by === name
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
                placeholder="Autre prénom…"
                value={['Victor', 'Sophie', 'Gautier'].includes(data.added_by ?? '') ? '' : (data.added_by ?? '')}
                onChange={e => setData(prev => ({ ...prev, added_by: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Priorité</label>
              <div className="flex gap-2">
                {[['low', '🌱 Faible'], ['medium', '⚡ Moyen'], ['high', '🔥 Haute']].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setData(prev => ({ ...prev, priority: v }))}
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

          {/* Alerte doublon */}
          {duplicate && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                {duplicate.reason === 'url'
                  ? '⚠️ Cette URL correspond à une offre déjà enregistrée'
                  : `⚠️ Cette offre ressemble à une existante (${duplicate.score}% de similarité)`}
              </p>
              <div className="bg-white rounded-xl p-3 text-sm text-gray-700 border border-amber-100">
                <p className="font-semibold">{duplicate.job.title as string}</p>
                <p className="text-gray-500">{duplicate.job.company as string}{duplicate.job.location ? ` — ${duplicate.job.location}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDuplicate(null)}
                  className="flex-1 py-2 border border-amber-300 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  ← Modifier ma saisie
                </button>
                <button
                  onClick={() => handleSave(true)}
                  className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors"
                >
                  Ajouter quand même
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => isEdit ? handleSave() : checkDuplicateThenSave()}
              disabled={saving || !data.title || !data.company}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : '🚀'}
              {saving ? 'Sauvegarde...' : isEdit ? 'Enregistrer' : 'Ajouter l\'offre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
