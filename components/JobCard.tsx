'use client';

import { useState } from 'react';
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

// Palette de couleurs déterministe selon l'initiale
const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname; // ex: careers.loreal.com
    const parts = hostname.split('.');
    // Garde seulement domaine + TLD (loreal.com), ignore les sous-domaines
    return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
  } catch { return null; }
}

function CompanyLogo({ company, url }: { company: string; url: string | null }) {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = getDomain(url);
  const initial = company.charAt(0).toUpperCase();
  const color = avatarColor(company);

  if (domain && !imgFailed) {
    return (
      <div className="w-9 h-9 rounded-xl border border-gray-100 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
        <img
          src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
          alt={company}
          className="w-7 h-7 object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <span className="text-white font-bold text-sm">{initial}</span>
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
        <CompanyLogo company={job.company} url={job.url} />
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
