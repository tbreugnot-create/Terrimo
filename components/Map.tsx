'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { COMMUNES, type Commune } from '@/lib/communes';

interface Agency {
  id: string;
  name: string;
  slug: string;
  commune: string;
  type: string;
  plan: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  google_rating: number | null;
  google_reviews: number;
  lat: number;
  lng: number;
  is_recommended: boolean;
}

interface MapProps {
  initialCommune?: string;
}

const BASSIN_CENTER: [number, number] = [44.68, -1.12];
const BASSIN_ZOOM = 11;

function planBadge(plan: string, is_recommended: boolean) {
  if (is_recommended) return '⭐ Recommandé';
  if (plan === 'pro') return 'Pro';
  return '';
}

export default function TerrimoMap({ initialCommune }: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<string | null>(initialCommune || null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [activeLayer, setActiveLayer] = useState<'agencies' | 'notaires' | 'diagnostiqueurs'>('agencies');
  const [loading, setLoading] = useState(true);

  // Init carte
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix icônes Leaflet avec Next.js
      const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
      const icon2x = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
      const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl: icon2x, shadowUrl: iconShadow });

      const map = L.map(mapDivRef.current!, {
        center: BASSIN_CENTER,
        zoom: BASSIN_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Polygones communes (zones cliquables)
      COMMUNES.forEach((commune) => {
        const tierColors: Record<string, string> = {
          premium: '#6366f1',
          equilibre: '#0ea5e9',
          emergent: '#10b981',
        };
        const color = tierColors[commune.tier] || '#94a3b8';

        const circle = L.circle([commune.lat, commune.lng], {
          radius: 2500,
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1.5,
        }).addTo(map);

        const label = L.divIcon({
          className: '',
          html: `<div class="commune-label">${commune.tierEmoji} ${commune.name}</div>`,
          iconAnchor: [40, 10],
        });
        L.marker([commune.lat, commune.lng], { icon: label, interactive: true })
          .addTo(map)
          .on('click', () => setSelectedCommune(commune.slug));

        circle.on('click', () => setSelectedCommune(commune.slug));
      });

      fetchAgencies(map, L);
    };

    initMap();
  }, []);

  async function fetchAgencies(map: LeafletMap, L: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
    setLoading(true);
    try {
      const res = await fetch('/api/agencies');
      const data: Agency[] = await res.json();
      setAgencies(data);
      renderMarkers(map, L, data);
    } finally {
      setLoading(false);
    }
  }

  function renderMarkers(map: LeafletMap, L: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any, data: Agency[]) {
    // Supprimer anciens marqueurs
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    data.forEach((agency) => {
      if (!agency.lat || !agency.lng) return;

      const bgColor = agency.plan === 'premium'
        ? '#6366f1'
        : agency.plan === 'pro'
        ? '#0ea5e9'
        : '#94a3b8';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${bgColor};
          border-radius:50%;
          width:${agency.is_recommended ? 14 : 10}px;
          height:${agency.is_recommended ? 14 : 10}px;
          border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconAnchor: [7, 7],
      });

      const marker = L.marker([agency.lat, agency.lng], { icon })
        .addTo(map)
        .on('click', () => setSelectedAgency(agency));

      markersRef.current.push(marker);
    });
  }

  const filteredAgencies = selectedCommune
    ? agencies.filter(a => {
        const commune = COMMUNES.find(c => c.slug === selectedCommune);
        return commune && a.commune === commune.name;
      })
    : agencies;

  const selectedCommuneData = selectedCommune ? COMMUNES.find(c => c.slug === selectedCommune) : null;

  return (
    <div className="relative w-full h-full flex">
      {/* Panneau latéral */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden z-10">
        {/* Header panneau */}
        <div className="p-4 border-b border-gray-100">
          {selectedCommuneData ? (
            <div>
              <button
                onClick={() => setSelectedCommune(null)}
                className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
              >
                ← Tout le Bassin
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCommuneData.tierEmoji}</span>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedCommuneData.name}</h2>
                  <p className="text-xs text-gray-500">{selectedCommuneData.tagline}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-semibold text-gray-900">Bassin d'Arcachon</h2>
              <p className="text-xs text-gray-500">{agencies.length} professionnels</p>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'agencies', label: '🏢 Agences' },
            { key: 'notaires', label: '⚖️ Notaires' },
            { key: 'diagnostiqueurs', label: '🔍 Diagn.' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveLayer(tab.key as typeof activeLayer)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeLayer === tab.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liste agences */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-gray-400">Chargement…</div>
          ) : filteredAgencies.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Aucune agence dans cette commune</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredAgencies.map((agency) => (
                <button
                  key={agency.id}
                  onClick={() => setSelectedAgency(agency)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {agency.is_recommended && (
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                            ⭐ Recommandé
                          </span>
                        )}
                        {agency.plan === 'pro' && !agency.is_recommended && (
                          <span className="text-xs bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">Pro</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{agency.name}</p>
                      <p className="text-xs text-gray-400">{agency.commune}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {agency.google_rating && (
                        <div className="text-xs text-amber-600 font-medium">★ {agency.google_rating}</div>
                      )}
                      <div className="text-xs text-gray-300 mt-0.5">→</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Communes rapides */}
        {!selectedCommune && (
          <div className="border-t border-gray-100 p-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">Communes</p>
            <div className="flex flex-wrap gap-1">
              {COMMUNES.map(c => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCommune(c.slug)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors"
                >
                  {c.tierEmoji} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Panel agence sélectionnée */}
        {selectedAgency && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl p-4 z-[1000] max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {selectedAgency.is_recommended && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    ⭐ Recommandé
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 mt-1">{selectedAgency.name}</h3>
                <p className="text-sm text-gray-500">{selectedAgency.commune}</p>
                {selectedAgency.google_rating && (
                  <p className="text-sm text-amber-600 mt-1">
                    ★ {selectedAgency.google_rating} ({selectedAgency.google_reviews} avis)
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedAgency(null)}
                className="text-gray-300 hover:text-gray-500 ml-2 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {selectedAgency.phone && (
                <a
                  href={`tel:${selectedAgency.phone}`}
                  className="flex-1 text-center text-sm bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  📞 Appeler
                </a>
              )}
              {selectedAgency.website && (
                <a
                  href={selectedAgency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Site web →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .commune-label {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .commune-label:hover {
          background: #f8fafc;
          border-color: #6366f1;
          color: #6366f1;
        }
      `}</style>
    </div>
  );
}
