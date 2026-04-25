'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { COMMUNES } from '@/lib/communes';

// ============================================================
// TYPES
// ============================================================
type ActeurType = 'agence' | 'notaire' | 'diagnostiqueur' | 'conciergerie';

interface Acteur {
  id: string;
  type: ActeurType;
  name: string;
  slug: string;
  plan: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  commune: string | null;
  code_postal: string | null;
  lat: number | null;
  lng: number | null;
  google_rating: number | null;
  google_reviews: number;
  meta: Record<string, unknown>;
  is_verified: boolean;
}

interface StatsBar {
  agence?: number;
  notaire?: number;
  diagnostiqueur?: number;
  conciergerie?: number;
}

// ============================================================
// CONFIG
// ============================================================
const BASSIN_CENTER: [number, number] = [44.68, -1.08];
const BASSIN_ZOOM = 11;

const TYPE_CONFIG: Record<ActeurType, { label: string; emoji: string; color: string; colorPremium: string }> = {
  agence:         { label: 'Agences',         emoji: '🏢', color: '#6366f1', colorPremium: '#4338ca' },
  notaire:        { label: 'Notaires',         emoji: '⚖️', color: '#10b981', colorPremium: '#059669' },
  diagnostiqueur: { label: 'Diagnostiqueurs',  emoji: '🔍', color: '#f59e0b', colorPremium: '#d97706' },
  conciergerie:   { label: 'Conciergeries',   emoji: '🏡', color: '#ec4899', colorPremium: '#db2777' },
};

// ============================================================
// MAP COMPONENT
// ============================================================
export default function TerrimoMap({ initialCommune }: { initialCommune?: string }) {
  const mapRef        = useRef<LeafletMap | null>(null);
  const mapDivRef     = useRef<HTMLDivElement>(null);
  const markersRef    = useRef<Marker[]>([]);
  const leafletRef    = useRef<typeof import('leaflet')['default'] | null>(null);

  const [acteurs, setActeurs]             = useState<Acteur[]>([]);
  const [stats, setStats]                 = useState<StatsBar>({});
  const [selectedCommune, setSelectedCommune] = useState<string | null>(initialCommune || null);
  const [selectedActeur, setSelectedActeur]   = useState<Acteur | null>(null);
  const [activeType, setActiveType]       = useState<ActeurType | 'all'>('agence');
  const [loading, setLoading]             = useState(true);

  // --------------------------------------------------------
  // Rendu des marqueurs
  // --------------------------------------------------------
  const renderMarkers = useCallback((map: LeafletMap, L: typeof import('leaflet')['default'], data: Acteur[], filterType: ActeurType | 'all', filterCommune: string | null) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const communeObj = filterCommune ? COMMUNES.find(c => c.slug === filterCommune) : null;

    data.forEach((acteur) => {
      if (!acteur.lat || !acteur.lng) return;
      if (filterType !== 'all' && acteur.type !== filterType) return;
      if (communeObj && acteur.commune !== communeObj.name) return;

      const cfg = TYPE_CONFIG[acteur.type] ?? TYPE_CONFIG.agence;
      const isPremium = acteur.plan === 'premium';
      const isPro = acteur.plan === 'pro';
      const color = isPremium ? cfg.colorPremium : isPro ? cfg.color : cfg.color;
      const size = isPremium ? 16 : isPro ? 13 : 11;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${color};
          border-radius:50%;
          width:${size}px;height:${size}px;
          border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
          cursor:pointer;
        "></div>`,
        iconAnchor: [size / 2, size / 2],
        iconSize: [size, size],
      });

      const marker = L.marker([acteur.lat, acteur.lng], { icon })
        .addTo(map)
        .on('click', () => setSelectedActeur(acteur));

      markersRef.current.push(marker);
    });
  }, []);

  // --------------------------------------------------------
  // Init carte Leaflet
  // --------------------------------------------------------
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      leafletRef.current = L;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

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

      // Zones communes
      COMMUNES.forEach((commune) => {
        const tierColors: Record<string, string> = {
          premium: '#6366f1', equilibre: '#0ea5e9', emergent: '#10b981',
        };
        const color = tierColors[commune.tier] || '#94a3b8';

        const circle = L.circle([commune.lat, commune.lng], {
          radius: 2500, color, fillColor: color, fillOpacity: 0.07, weight: 1.5,
        }).addTo(map);

        const label = L.divIcon({
          className: '',
          html: `<div class="commune-label">${commune.tierEmoji} ${commune.name}</div>`,
          iconAnchor: [40, 10],
        });
        L.marker([commune.lat, commune.lng], { icon: label, interactive: true })
          .addTo(map)
          .on('click', () => setSelectedCommune(c => c === commune.slug ? null : commune.slug));
        circle.on('click', () => setSelectedCommune(c => c === commune.slug ? null : commune.slug));
      });
    };

    initMap();
  }, []);

  // --------------------------------------------------------
  // Fetch acteurs depuis API
  // --------------------------------------------------------
  useEffect(() => {
    const fetchActeurs = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/acteurs');
        const data = await res.json();
        const list: Acteur[] = data.acteurs ?? [];
        setActeurs(list);
        setStats(data.stats ?? {});
        if (mapRef.current && leafletRef.current) {
          renderMarkers(mapRef.current, leafletRef.current, list, 'agence', null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActeurs();
  }, [renderMarkers]);

  // --------------------------------------------------------
  // Re-render quand filtre change
  // --------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !acteurs.length) return;
    renderMarkers(mapRef.current, leafletRef.current, acteurs, activeType, selectedCommune);
    setSelectedActeur(null);
  }, [activeType, selectedCommune, acteurs, renderMarkers]);

  // --------------------------------------------------------
  // Helpers
  // --------------------------------------------------------
  const communeObj = selectedCommune ? COMMUNES.find(c => c.slug === selectedCommune) : null;

  const filteredActeurs = acteurs.filter(a => {
    if (activeType !== 'all' && a.type !== activeType) return false;
    if (communeObj && a.commune !== communeObj.name) return false;
    return true;
  });

  const goToCommune = (slug: string) => {
    const c = COMMUNES.find(x => x.slug === slug);
    if (c && mapRef.current) {
      mapRef.current.flyTo([c.lat, c.lng], 13, { duration: 0.8 });
    }
    setSelectedCommune(slug);
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div className="relative w-full h-full flex">

      {/* ======================== PANNEAU GAUCHE ======================== */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden z-10">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          {communeObj ? (
            <div>
              <button onClick={() => setSelectedCommune(null)}
                className="text-xs text-gray-400 hover:text-indigo-600 mb-1 flex items-center gap-1">
                ↩ Vue d'ensemble
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">{communeObj.tierEmoji}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">{communeObj.name}</h2>
                  <p className="text-xs text-gray-400 leading-tight">{communeObj.tagline}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-bold text-gray-900">Bassin d'Arcachon</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {(stats.agence || 0) + (stats.notaire || 0) + (stats.diagnostiqueur || 0)} professionnels
              </p>
            </div>
          )}
        </div>

        {/* Liste acteurs filtrés */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
              <p className="text-xs text-gray-400">Chargement…</p>
            </div>
          ) : filteredActeurs.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              Aucun acteur pour cette sélection
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredActeurs.map((a) => (
                <button key={a.id} onClick={() => {
                  setSelectedActeur(a);
                  if (a.lat && a.lng && mapRef.current) {
                    mapRef.current.flyTo([a.lat, a.lng], 15, { duration: 0.6 });
                  }
                }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${selectedActeur?.id === a.id ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {a.plan === 'premium' && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-semibold mr-1">⭐ Premium</span>
                      )}
                      <p className="text-sm font-medium text-gray-800 truncate leading-tight">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.commune}</p>
                    </div>
                    {a.google_rating && (
                      <div className="text-xs text-amber-500 font-semibold flex-shrink-0">
                        ★ {Number(a.google_rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Communes — organisées par tier */}
        {!communeObj && (
          <div className="border-t border-gray-100 px-3 py-3 space-y-2">
            {[
              { tier: 'premium',  label: 'PREMIUM',   color: 'text-indigo-600' },
              { tier: 'equilibre', label: 'ÉQUILIBRÉ', color: 'text-sky-600' },
              { tier: 'emergent', label: 'ÉMERGENT',  color: 'text-emerald-600' },
            ].map(({ tier, label, color }) => (
              <div key={tier}>
                <p className={`text-xs font-bold ${color} mb-1`}>💎 {label}</p>
                <div className="flex flex-wrap gap-1">
                  {COMMUNES.filter(c => c.tier === tier).map(c => (
                    <button key={c.slug}
                      onClick={() => goToCommune(c.slug)}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================== CARTE ======================== */}
      <div className="flex-1 relative">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Bandeau stats — en haut de la carte */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[800] flex gap-2 bg-white rounded-full shadow-md px-3 py-1.5 border border-gray-100">
          <span className="text-xs text-gray-500 font-medium">📍 {COMMUNES.length} communes</span>
          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-500 font-medium">🏢 {stats.agence || '…'} agences</span>
          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-500 font-medium">🔍 {stats.diagnostiqueur || '…'} diagnostiqueurs</span>
          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-500 font-medium">⚖️ {stats.notaire || '…'} notaires</span>
        </div>

        {/* Filtres type — droite */}
        <div className="absolute top-3 right-3 z-[800] flex flex-col gap-2">
          {(Object.entries(TYPE_CONFIG) as [ActeurType, typeof TYPE_CONFIG[ActeurType]][]).map(([type, cfg]) => (
            <button key={type}
              onClick={() => setActiveType(t => t === type ? 'all' : type)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold shadow-md transition-all border-2 ${
                activeType === type
                  ? 'bg-white border-indigo-600 text-indigo-700 shadow-indigo-100'
                  : 'bg-white border-transparent text-gray-600 hover:border-gray-200'
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              {stats[type] && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {stats[type]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Fiche acteur sélectionné */}
        {selectedActeur && (
          <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-xl p-4 z-[1000] border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs text-gray-400 font-medium">
                    {TYPE_CONFIG[selectedActeur.type]?.emoji} {TYPE_CONFIG[selectedActeur.type]?.label.slice(0, -1)}
                  </span>
                  {selectedActeur.plan === 'premium' && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">Premium</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 leading-tight">{selectedActeur.name}</h3>
                {selectedActeur.commune && (
                  <p className="text-sm text-gray-500 mt-0.5">{selectedActeur.commune}</p>
                )}
                {selectedActeur.google_rating && (
                  <p className="text-sm text-amber-500 mt-1 font-semibold">
                    ★ {Number(selectedActeur.google_rating).toFixed(1)}
                    <span className="text-gray-400 font-normal ml-1">({selectedActeur.google_reviews} avis)</span>
                  </p>
                )}
                {selectedActeur.address && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{selectedActeur.address}</p>
                )}
                {/* Infos spécifiques notaire */}
                {selectedActeur.type === 'notaire' && selectedActeur.meta?.notaires_names && (
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedActeur.meta.notaires_names as string[]).join(', ')}
                  </p>
                )}
                {/* Services diagnostiqueur */}
                {selectedActeur.type === 'diagnostiqueur' && selectedActeur.meta?.services && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(selectedActeur.meta.services as string[]).slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedActeur(null)}
                className="text-gray-300 hover:text-gray-500 text-xl leading-none mt-0.5">×</button>
            </div>
            <div className="mt-3 flex gap-2">
              {selectedActeur.phone && (
                <a href={`tel:${selectedActeur.phone}`}
                  className="flex-1 text-center text-sm bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                  📞 Appeler
                </a>
              )}
              {selectedActeur.website && (
                <a href={selectedActeur.website} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center text-sm border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  Site web →
                </a>
              )}
            </div>
          </div>
        )}

        {/* CTAs bas — Chercher / Vendre */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[800] flex gap-3">
          <button
            onClick={() => setActiveType('agence')}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            🔍 Chercher un bien
          </button>
          <Link href="/evaluer"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            🏡 Vendre mon bien
          </Link>
        </div>
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
          pointer-events: auto;
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
