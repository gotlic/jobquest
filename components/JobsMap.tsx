'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Job } from '@/lib/db';
import type L from 'leaflet';

/* ── Cache géocodage persistant (localStorage) ─────────────── */
const MEM: Record<string, { lat: number; lon: number } | null> = {};

function loadCache() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('jq_geo_cache');
    if (raw) Object.assign(MEM, JSON.parse(raw));
  } catch { /* ignore */ }
}

function saveCache() {
  try { localStorage.setItem('jq_geo_cache', JSON.stringify(MEM)); } catch { /* ignore */ }
}

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  if (location in MEM) return MEM[location];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();
    const result = data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
    MEM[location] = result;
    saveCache();
    return result;
  } catch {
    MEM[location] = null;
    return null;
  }
}

/* ── Clustering grille 0.5° (~50 km) ───────────────────────── */
function clusterKey(lat: number, lon: number) {
  return `${(Math.round(lat * 2) / 2).toFixed(1)},${(Math.round(lon * 2) / 2).toFixed(1)}`;
}

type GeoJob = { job: Job; lat: number; lon: number };

const STATUS_COLOR: Record<string, string> = {
  todo:      '#6b7280',
  applied:   '#7c3aed',
  followup:  '#ec4899',
  interview: '#f59e0b',
  offer:     '#10b981',
  rejected:  '#ef4444',
};

/* ── Composant ──────────────────────────────────────────────── */
export default function JobsMap({ jobs }: { jobs: Job[] }) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<L.Map | null>(null);
  const leaflet = useRef<typeof L | null>(null);

  // Stockés en ref pour éviter la race condition map-init / geocoding
  const geocodedRef = useRef<GeoJob[]>([]);

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [tick, setTick] = useState(0); // force re-render markers après init carte

  /* ── Redessiner les markers ─────────────────────────────── */
  function drawMarkers() {
    const LL = leaflet.current;
    const map = mapInst.current;
    const geocoded = geocodedRef.current;
    if (!LL || !map || geocoded.length === 0) return;

    // Supprimer les anciens
    map.eachLayer(layer => {
      if ((layer as unknown as { _jqMarker?: boolean })._jqMarker) map.removeLayer(layer);
    });

    // Clustering
    const clusters = new Map<string, GeoJob[]>();
    geocoded.forEach(item => {
      const key = clusterKey(item.lat, item.lon);
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(item);
    });

    clusters.forEach(items => {
      const lat = items.reduce((s, i) => s + i.lat, 0) / items.length;
      const lon = items.reduce((s, i) => s + i.lon, 0) / items.length;
      const n = items.length;

      // Couleur statut dominant
      const sc: Record<string, number> = {};
      items.forEach(i => { sc[i.job.status] = (sc[i.job.status] ?? 0) + 1; });
      const dominant = Object.entries(sc).sort((a, b) => b[1] - a[1])[0][0];
      const color = STATUS_COLOR[dominant] ?? '#6b7280';

      const size = n > 1 ? 36 : 26;
      const icon = LL.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${n > 1 ? 13 : 11}px;font-weight:700;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer">${n}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const tooltipHtml =
        items.slice(0, 6).map(i =>
          `<div style="padding:2px 0;line-height:1.5">
            <span style="font-weight:700;font-size:12px;white-space:normal;word-break:break-word;display:block">${i.job.title}</span>
            <span style="color:#6b7280;font-size:11px;display:block">${i.job.company}${i.job.location ? ` · ${i.job.location}` : ''}</span>
          </div>`
        ).join('<div style="border-top:1px solid #e5e7eb;margin:3px 0"></div>') +
        (items.length > 6 ? `<div style="color:#9ca3af;font-size:11px;padding-top:4px">+${items.length - 6} autres</div>` : '');

      const marker = LL.marker([lat, lon], { icon }) as L.Marker & { _jqMarker?: boolean };
      marker._jqMarker = true;
      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, -(size / 2) - 4],
        opacity: 1,
        className: 'jobs-map-tooltip',
      });
      marker.addTo(map);
    });
  }

  /* ── Init Leaflet (une seule fois) ──────────────────────── */
  useEffect(() => {
    loadCache();
    if (!mapRef.current || typeof window === 'undefined') return;

    import('leaflet').then(LL => {
      if (!mapRef.current || mapInst.current) return;
      leaflet.current = LL;

      const map = LL.map(mapRef.current, {
        center: [46.5, 2.5],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      LL.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      mapInst.current = map;

      // Si géocodage déjà terminé avant l'init carte, dessiner maintenant
      drawMarkers();
      setTick(t => t + 1);
    });

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
      leaflet.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Géocodage ──────────────────────────────────────────── */
  useEffect(() => {
    loadCache();
    const active = jobs.filter(j => j.status !== 'archived' && j.location);
    if (active.length === 0) return;

    const uniqueLocs = [...new Set(active.map(j => j.location!))];

    // Ceux déjà en cache → résultat immédiat
    const uncached = uniqueLocs.filter(l => !(l in MEM));

    async function run() {
      if (uncached.length > 0) setProgress({ done: 0, total: uncached.length });

      for (let i = 0; i < uncached.length; i++) {
        await geocode(uncached[i]);
        setProgress({ done: i + 1, total: uncached.length });
        if (i < uncached.length - 1) await new Promise(r => setTimeout(r, 300));
      }

      // Construire la liste finale
      const results: GeoJob[] = [];
      active.forEach(job => {
        const c = MEM[job.location!];
        if (c) results.push({ job, lat: c.lat, lon: c.lon });
      });
      geocodedRef.current = results;
      setProgress(null);
      drawMarkers();
    }

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  // Redessiner quand la carte est prête et geocoded déjà rempli
  useEffect(() => { drawMarkers(); }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const locCount = geocodedRef.current.length;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 480 }}>
      <style>{`
        .jobs-map-tooltip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 10px 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,.12) !important;
          font-family: inherit !important;
          pointer-events: none;
          max-width: 220px;
          white-space: normal !important;
          word-break: break-word;
        }
        .jobs-map-tooltip::before { display:none !important; }
        .leaflet-attribution-flag { display:none !important; }
      `}</style>

      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {locCount > 0 && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">
          📍 {locCount} offre{locCount > 1 ? 's' : ''} localisée{locCount > 1 ? 's' : ''}
        </div>
      )}

      {progress && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-[1001]">
          <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500">Géolocalisation {progress.done}/{progress.total}</p>
        </div>
      )}

      {locCount > 0 && !progress && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs shadow-sm border border-gray-100 flex flex-col gap-1">
          {Object.entries({ todo: '📋 À explorer', applied: '🚀 Postulé', interview: '🤝 Entretien', offer: '🎉 Offre !' }).map(([k, l]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLOR[k] }} />
              <span className="text-gray-600">{l}</span>
            </div>
          ))}
        </div>
      )}

      {!progress && jobs.filter(j => j.status !== 'archived' && j.location).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-[1001] rounded-2xl">
          <p className="text-sm text-gray-400">Aucune offre avec un lieu renseigné</p>
        </div>
      )}
    </div>
  );
}
