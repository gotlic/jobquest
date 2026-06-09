'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Job } from '@/lib/db';

// Cache géocodage partagé avec LocationTooltip
const geoCache: Record<string, { lat: number; lon: number } | null> = {};

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  if (location in geoCache) return geoCache[location];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();
    const result = data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
    geoCache[location] = result;
    return result;
  } catch {
    geoCache[location] = null;
    return null;
  }
}

/** Clustering grille 0.5° (~50 km) */
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

export default function JobsMap({ jobs }: { jobs: Job[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<import('leaflet').Map | null>(null);
  const [geocoded, setGeocoded] = useState<GeoJob[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  /* ── Géocodage ──────────────────────────────────────────── */
  useEffect(() => {
    const active = jobs.filter(j => j.status !== 'archived' && j.location);
    if (active.length === 0) { setProgress(null); return; }

    // Dédupliquer les lieux avant l'appel API
    const uniqueLocs = [...new Set(active.map(j => j.location!))];
    setProgress({ done: 0, total: uniqueLocs.length });

    let cancelled = false;
    (async () => {
      for (let i = 0; i < uniqueLocs.length; i++) {
        if (cancelled) return;
        await geocode(uniqueLocs[i]);
        if (!cancelled) setProgress({ done: i + 1, total: uniqueLocs.length });
        if (i < uniqueLocs.length - 1) await new Promise(r => setTimeout(r, 300)); // 3 req/s max
      }
      if (!cancelled) {
        const results: GeoJob[] = [];
        active.forEach(job => {
          const coords = geoCache[job.location!];
          if (coords) results.push({ job, lat: coords.lat, lon: coords.lon });
        });
        setGeocoded(results);
        setProgress(null);
      }
    })();
    return () => { cancelled = true; };
  }, [jobs]);

  /* ── Init Leaflet ───────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;
    let map: import('leaflet').Map;

    import('leaflet').then(L => {
      if (!mapRef.current) return;
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }

      map = L.map(mapRef.current!, {
        center: [46.5, 2.5],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInst.current = map;
    });

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Markers & clustering ───────────────────────────────── */
  useEffect(() => {
    if (!mapInst.current || geocoded.length === 0) return;

    import('leaflet').then(L => {
      const map = mapInst.current!;

      // Supprimer les anciens markers
      map.eachLayer(layer => {
        if ((layer as { _isJobMarker?: boolean })._isJobMarker) map.removeLayer(layer);
      });

      // Regrouper par cellule de grille ~50km
      const clusters = new Map<string, GeoJob[]>();
      geocoded.forEach(item => {
        const key = clusterKey(item.lat, item.lon);
        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key)!.push(item);
      });

      clusters.forEach(items => {
        // Centroïde du cluster
        const lat = items.reduce((s, i) => s + i.lat, 0) / items.length;
        const lon = items.reduce((s, i) => s + i.lon, 0) / items.length;
        const n = items.length;
        const isCluster = n > 1;

        // Couleur dominante (statut le plus représenté)
        const statusCount: Record<string, number> = {};
        items.forEach(i => { statusCount[i.job.status] = (statusCount[i.job.status] ?? 0) + 1; });
        const dominant = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0][0];
        const color = STATUS_COLOR[dominant] ?? '#6b7280';

        const size = isCluster ? 36 : 26;
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:${color};
            color:#fff;
            border-radius:50%;
            width:${size}px;height:${size}px;
            display:flex;align-items:center;justify-content:center;
            font-size:${isCluster ? 13 : 11}px;font-weight:700;
            border:2.5px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
            cursor:pointer;
          ">${n}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const tooltipHtml = items.slice(0, 6).map(i =>
          `<div style="padding:2px 0;line-height:1.4">
            <span style="font-weight:700;font-size:12px">${i.job.title}</span><br>
            <span style="color:#6b7280;font-size:11px">${i.job.company}${i.job.location ? ` · ${i.job.location}` : ''}</span>
          </div>`
        ).join('<div style="border-top:1px solid #e5e7eb;margin:3px 0"></div>') +
          (items.length > 6 ? `<div style="color:#9ca3af;font-size:11px;padding-top:4px">+${items.length - 6} autres</div>` : '');

        const marker = L.marker([lat, lon], { icon }) as import('leaflet').Marker & { _isJobMarker?: boolean };
        marker._isJobMarker = true;
        marker.bindTooltip(tooltipHtml, {
          direction: 'top',
          offset: [0, -(size / 2) - 4],
          opacity: 1,
          className: 'jobs-map-tooltip',
        });
        marker.addTo(map);
      });
    });
  }, [geocoded]);

  const activeCount = jobs.filter(j => j.status !== 'archived' && j.location).length;
  const localisedCount = geocoded.length;

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
          max-width: 260px;
        }
        .jobs-map-tooltip::before { display:none !important; }
        .leaflet-attribution-flag { display:none !important; }
      `}</style>

      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Badge compte */}
      {localisedCount > 0 && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">
          📍 {localisedCount} offre{localisedCount > 1 ? 's' : ''} localisée{localisedCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Progression */}
      {progress && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-[1001]">
          <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Géolocalisation {progress.done}/{progress.total}</p>
        </div>
      )}

      {/* Légende */}
      {localisedCount > 0 && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs shadow-sm border border-gray-100 flex flex-col gap-1">
          {Object.entries({ todo: '📋 À explorer', applied: '🚀 Postulé', interview: '🤝 Entretien', offer: '🎉 Offre !' }).map(([k, l]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[k] }} />
              <span className="text-gray-600">{l}</span>
            </div>
          ))}
        </div>
      )}

      {/* Etat vide */}
      {!progress && activeCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-[1001] rounded-2xl">
          <p className="text-sm text-gray-400">Aucune offre avec un lieu renseigné</p>
        </div>
      )}
    </div>
  );
}
