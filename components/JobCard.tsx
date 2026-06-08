'use client';

import { MapPin, Calendar, DollarSign, ExternalLink, User, Wifi, WifiOff, Laptop } from 'lucide-react';
import { Job } from '@/lib/db';

const priorityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-600 border-red-200',
  medium: 'bg-amber-100 text-amber-600 border-amber-200',
  low: 'bg-green-100 text-green-600 border-green-200',
};

const priorityLabel: Record<string, string> = {
  high: '🔥 Haute', medium: '⚡ Moyen', low: '🌱 Faible',
};

const remoteIcons: Record<string, React.ReactNode> = {
  full: <span title="Full remote" className="text-emerald-500"><Wifi size={12} /></span>,
  partial: <span title="Hybride" className="text-blue-500"><Laptop size={12} /></span>,
  no: <span title="Présentiel" className="text-gray-400"><WifiOff size={12} /></span>,
};

// Mapping mots-clés → emoji métier
const JOB_ICONS: [RegExp, string, string, string][] = [
  // Amélioration continue / Lean / Qualité
  [/am[eé]lioration.continue|lean|kaizen|six.sigma|5s|vsm|performance.op/i, '⚙️', 'bg-orange-100', 'Amélioration continue'],
  [/qualit[eé]|qse|qhse|conformit[eé]|audit|certification|iso/i, '✅', 'bg-green-100', 'Qualité'],
  // Ingénierie industrielle / Méthodes
  [/m[eé]thodes?|industriali[sz]|process engineer|ing[eé]nieur.m[eé]thod/i, '🔩', 'bg-slate-100', 'Méthodes & Industrialisation'],
  [/maintenance|fiabilit[eé]|mro|technicien|[eé]lectrotech|automaticien/i, '🔧', 'bg-blue-100', 'Maintenance'],
  [/automatisme|robotique|automate|plc|scada|supervision/i, '🤖', 'bg-indigo-100', 'Automatisme & Robotique'],
  [/production|manufacturing|fabrication|op[eé]rateur|usinage|fonderie|moulage/i, '🏭', 'bg-amber-100', 'Production & Fabrication'],
  // Supply chain / Logistique
  [/supply.chain|logistique|entrepôt|ordonnancement|planification|approvisionnement|achat/i, '📦', 'bg-yellow-100', 'Supply Chain & Logistique'],
  // IT / Data / Digital
  [/d[eé]veloppeur|software|fullstack|backend|frontend|devops|cloud|architect/i, '💻', 'bg-violet-100', 'IT & Développement'],
  [/data|analyst|bi |business.intel|machine.learning|ia |intelligence.artificielle/i, '📊', 'bg-cyan-100', 'Data & Analyse'],
  [/cyber|s[eé]curit[eé].info|ssi|rssi/i, '🛡️', 'bg-red-100', 'Cybersécurité'],
  // Finance / Contrôle
  [/finance|comptab|contr[oô]le.gestion|audit.financ|tresor|budget/i, '💰', 'bg-emerald-100', 'Finance & Contrôle de gestion'],
  // R&D / Science
  [/recherche|r&d|r.et.d|laboratoire|scientifique|chimiste|pharmacie|biotech/i, '🔬', 'bg-lime-100', 'R&D & Sciences'],
  // Design / Architecture
  [/designer|ux|ui |design.produit|ergonomie|graphiste/i, '🎨', 'bg-rose-100', 'Design & UX'],
  [/architecte|bâtiment|genie.civil|btp|construction|urbanisme/i, '🏗️', 'bg-stone-100', 'BTP & Architecture'],
  // HSE
  [/hse|environnement|s[eé]curit[eé].travail|pr[eé]vention.risque/i, '🦺', 'bg-orange-100', 'HSE & Environnement'],
  // Juridique
  [/juridique|avocat|droit|compliance|legal/i, '⚖️', 'bg-gray-100', 'Juridique & Compliance'],
];

function getJobIcon(title: string, summary?: string | null): { emoji: string; bg: string; label: string } {
  const text = `${title} ${summary ?? ''}`;
  for (const [pattern, emoji, bg, label] of JOB_ICONS) {
    if (pattern.test(text)) return { emoji, bg, label };
  }
  return { emoji: '🏢', bg: 'bg-gray-100', label: 'Autre' };
}

function JobIcon({ title, summary }: { title: string; summary?: string | null }) {
  const { emoji, bg, label } = getJobIcon(title, summary);
  return (
    <div
      title={label}
      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 shadow-sm text-xl cursor-default`}
    >
      {emoji}
    </div>
  );
}

export default function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-violet-200 cursor-pointer transition-all group"
    >
      <div className="flex items-start gap-3 mb-2">
        <JobIcon title={job.title} summary={job.summary} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-violet-700 transition-colors">{job.title}</h3>
          <p className="text-sm text-gray-500 font-medium truncate">{job.company}</p>
        </div>
      </div>

      {job.summary && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">{job.summary}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
        {job.location && (
          <span className="flex items-center gap-0.5">
            <MapPin size={10} /> {job.location}
          </span>
        )}
        {job.remote && remoteIcons[job.remote]}
        {job.salary && (
          <span className="flex items-center gap-0.5">
            <DollarSign size={10} /> {job.salary}
          </span>
        )}
        {job.start_date && (
          <span className="flex items-center gap-0.5">
            <Calendar size={10} /> {job.start_date}
          </span>
        )}
        <span className={`px-2 py-0.5 rounded-full border font-semibold ${priorityStyles[job.priority] ?? priorityStyles.medium}`}>
          {priorityLabel[job.priority] ?? '⚡ Moyen'}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <User size={10} /> {job.added_by}
        </span>
        <div className="flex items-center gap-2">
          {job.contact_name && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">👤 {job.contact_name}</span>
          )}
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-gray-400 hover:text-violet-600 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
