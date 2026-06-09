'use client';

import { useState } from 'react';

// Cache en mémoire pour éviter les appels répétés à Nominatim
const geocodeCache: Record<string, { lat: number; lon: number } | null> = {};

export function LocationTooltip({ location, children }: { location: string; children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null | undefined>(undefined);
  const [visible, setVisible] = useState(false);

  async function geocode() {
    if (coords !== undefined) return;
    if (location in geocodeCache) { setCoords(geocodeCache[location]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      const result = data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
      geocodeCache[location] = result;
      setCoords(result);
    } catch {
      geocodeCache[location] = null;
      setCoords(null);
    }
  }

  // Bbox centrée sur la ville, ~1/4 de la France (zoom x4)
  const iframeSrc = coords
    ? (() => {
        const dLon = 3.75;
        const dLat = 2.75;
        const bbox = `${coords.lon - dLon}%2C${coords.lat - dLat}%2C${coords.lon + dLon}%2C${coords.lat + dLat}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;
      })()
    : null;

  return (
    <span
      className="relative cursor-default"
      onMouseEnter={() => { setVisible(true); geocode(); }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          className="absolute left-0 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ bottom: 'calc(100% + 8px)', width: 320 }}
        >
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              width={320}
              height={220}
              scrolling="no"
              style={{ border: 'none', display: 'block', pointerEvents: 'none' }}
              title={`Carte — ${location}`}
            />
          ) : (
            <div className="flex items-center justify-center text-xs text-gray-400" style={{ height: 120 }}>
              {coords === undefined ? 'Localisation…' : 'Ville introuvable sur la carte'}
            </div>
          )}
          <div className="px-3 py-2 text-sm text-gray-700 font-medium border-t border-gray-100 flex items-center gap-1.5">
            📍 {location}
          </div>
        </div>
      )}
    </span>
  );
}
