'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

// Cache en mémoire pour éviter les appels répétés à Nominatim
const geocodeCache: Record<string, { lat: number; lon: number } | null> = {};

export function LocationTooltip({ location }: { location: string }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null | undefined>(undefined);
  const [visible, setVisible] = useState(false);

  async function geocode() {
    if (coords !== undefined) return; // déjà tenté
    const cached = geocodeCache[location];
    if (cached !== undefined) { setCoords(cached); return; }

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

  // Carte centrée sur la France entière (zoom 6), marqueur sur la ville
  const mapUrl = coords
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=46.5,2.5&zoom=6&size=220x160&markers=${coords.lat},${coords.lon},red-pushpin`
    : null;

  return (
    <span
      className="relative flex items-center gap-0.5 cursor-default"
      onMouseEnter={() => { setVisible(true); geocode(); }}
      onMouseLeave={() => setVisible(false)}
    >
      <MapPin size={10} />
      {location}

      {visible && (
        <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ width: 220 }}>
          {mapUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mapUrl}
              alt={`Carte — ${location}`}
              width={220}
              height={160}
              className="block"
            />
          ) : (
            <div className="flex items-center justify-center text-xs text-gray-400" style={{ height: 80 }}>
              {coords === undefined ? '…' : 'Lieu introuvable'}
            </div>
          )}
          <div className="px-2 py-1 text-xs text-gray-600 font-medium truncate border-t border-gray-100">
            📍 {location}
          </div>
        </div>
      )}
    </span>
  );
}
