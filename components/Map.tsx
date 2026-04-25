'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
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
  agence:         { label: 'Agences',        emoji: '🏢', color: '#6366f1', colorPremium: '#4338ca' },
  notaire:        { label: 'Notaires',        emoji: '⚖️', color: '#10b981', colorPremium: '#059669' },
  diagnostiqueur: { label: 'Diagnostiqueurs', emoji: '🔍', color: '#f59e0b', colorPremium: '#d97706' },
  conciergerie:   { label: 'Conciergeries',  emoji: '🏡', color: '#ec4899', colorPremium: '#db2777' },
};

// ============================================================
// MAP COMPONENT
// ============================================================
export default function TerrimoMap({ initialCommune }: { initialCommune?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef     = useRef<any>(null);
  const mapDivRef  = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);

  const [acteurs, setActeurs]                 = useState<Acteur[]>([]);
  const [stats, setStats]                     = useState<StatsBar>({});
  const [selectedCommune, setSelectedCommune] = useState<string | null>(initialCommune || null);
  const [selectedActeur, setSelectedActeur]   = useState<Acteur | null>(null);
  const [activeType, setActiveType]           = useState<ActeurType | 'all'>('agence');
  const [loading, setLoading]                 = useState(true);
  const [mapActive, setMapActive]             = useState(false);
  const [showHint, setShowHint]               = useState(false);
  const [mobileView, setMobileView]           = useState<'list' | 'map'>('list');
  const [search, setSearch]                   = useState('');        // ← recherche par nom

  // --------------------------------------------------------
  // Inject CSS
  // --------------------------------------------------------
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // --------------------------------------------------------
  // Rendu des marqueurs
  // --------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMarkers = useCallback((map: any, L: any, data: Acteur[], filterType: ActeurType | 'all', filterCommune: string | null) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const communeObj = filterCommune ? COMMUNES.find(c => c.slug === filterCommune) : null;

    data.forEach((acteur) => {
      if (!acteur.lat || !acteur.lng) return;
      if (filterType !== 'all' && acteur.type !== filterType) return;
      if (communeObj && acteur.commune !== communeObj.name) return;

      const cfg = TYPE_CONFIG[acteur.type] ?? TYPE_CONFIG.agence;
      const size = 12; // même taille pour tous — pas de hiérarchie commerciale

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${cfg.color};border-radius:50%;
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
  // Init carte Leaflet — scrollWheelZoom OFF par défaut
  // --------------------------------------------------------
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;

    const initMap = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (await import('leaflet') as any).default ?? await import('leaflet');
      leafletRef.current = L;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapDivRef.current!, {
        center: BASSIN_CENTER,
        zoom: BASSIN_ZOOM,
        zoomControl: true,
        scrollWheelZoom: false,   // ← désactivé par défaut
        dragging: true,
        tap: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
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
  // Activation/désactivation du zoom à la molette
  // --------------------------------------------------------
  const activateMap = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.scrollWheelZoom.enable();
    setMapActive(true);
    setShowHint(false);
  }, []);

  const deactivateMap = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.scrollWheelZoom.disable();
    setMapActive(false);
  }, []);

  // Hint si l'utilisateur scroll sans avoir activé la carte
  const handleMapWheel = useCallback(() => {
    if (!mapActive) {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 2000);
      return () => clearTimeout(t);
    }
  }, [mapActive]);

  // --------------------------------------------------------
  // Fetch acteurs
  // --------------------------------------------------------
  useEffect(() => {
    const fetchActeurs = async () => {
      setLoading(true);
      try {
        const res  = await fetch('/api/acteurs');
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

  // Invalidate size quand on bascule sur la vue carte (mobile)
  useEffect(() => {
    if (mobileView === 'map' && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 100);
    }
  }, [mobileView]);

  // --------------------------------------------------------
  // Helpers
  // --------------------------------------------------------
  const communeObj = selectedCommune ? COMMUNES.find(c => c.slug === selectedCommune) : null;

  const searchTerm = search.trim().toLowerCase();
  const filteredActeurs = acteurs.filter(a => {
    if (activeType !== 'all' && a.type !== activeType) return false;
    if (communeObj && a.commune !== communeObj.name) return false;
    if (searchTerm && !a.name.toLowerCase().includes(searchTerm) && !a.commune?.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  const goToCommune = (slug: string) => {
    const c = COMMUNES.find(x => x.slug === slug);
    if (c && mapRef.current) mapRef.current.flyTo([c.lat, c.lng], 13, { duration: 0.8 });
    setSelectedCommune(slug);
    setMobileView('map');
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ═══════════════════════ PANNEAU GAUCHE (liste) ═══════════════════════ */}
      <div style={{
        width: '320px',
        flexShrink: 0,
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 10,
        // Mobile : caché si vue carte active
        ...(typeof window !== 'undefined' && window.innerWidth < 768 && mobileView === 'map'
          ? { display: 'none' } : {}),
      }}
        className={`map-left-panel ${mobileView === 'map' ? 'hidden-mobile' : ''}`}
      >
        {/* ─── Header commune / global ─── */}
        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
          {communeObj ? (
            <div>
              <button onClick={() => setSelectedCommune(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px',
                marginBottom: '10px', padding: 0, minHeight: 'auto',
              }}>
                ← Vue d&apos;ensemble
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{communeObj.tierEmoji}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{communeObj.name}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>{communeObj.tagline}</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Bassin d&apos;Arcachon</div>
              <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '4px' }}>
                {searchTerm
                  ? `${filteredActeurs.length} résultat${filteredActeurs.length > 1 ? 's' : ''} pour « ${search} »`
                  : `${(stats.agence || 0) + (stats.notaire || 0) + (stats.diagnostiqueur || 0) + (stats.conciergerie || 0)} professionnels référencés`
                }
              </div>
            </div>
          )}
        </div>

        {/* ─── Recherche par nom ─── */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '1rem', pointerEvents: 'none', lineHeight: 1,
            }}>🔎</span>
            <input
              type="text"
              placeholder="Rechercher une agence, un notaire…"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedCommune(null); }}
              style={{
                width: '100%', padding: '9px 10px 9px 34px',
                border: '1.5px solid #e2e8f0', borderRadius: '10px',
                fontSize: '.9375rem', color: '#1e293b',
                background: '#f8fafc', outline: 'none',
                transition: 'border-color .15s',
                minHeight: 'auto', boxSizing: 'border-box',
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; (e.target as HTMLInputElement).style.background = 'white'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'; (e.target as HTMLInputElement).style.background = '#f8fafc'; }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: '#e2e8f0', border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', cursor: 'pointer', fontSize: '.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', minHeight: 'auto', padding: 0,
              }}>×</button>
            )}
          </div>
        </div>

        {/* ─── Filtres type ─── */}
        <div style={{
          display: 'flex', gap: '6px', padding: '10px 16px',
          borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap',
        }}>
          {(Object.entries(TYPE_CONFIG) as [ActeurType, typeof TYPE_CONFIG[ActeurType]][]).map(([type, cfg]) => (
            <button key={type}
              onClick={() => setActiveType(t => t === type ? 'all' : type)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '20px',
                fontSize: '.8125rem', fontWeight: 600,
                border: activeType === type ? '2px solid #6366f1' : '2px solid #e2e8f0',
                background: activeType === type ? '#eef2ff' : 'white',
                color: activeType === type ? '#4338ca' : '#64748b',
                cursor: 'pointer', transition: 'all .15s ease', minHeight: '32px',
              }}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              {stats[type] != null && (
                <span style={{
                  background: activeType === type ? '#c7d2fe' : '#f1f5f9',
                  color: activeType === type ? '#3730a3' : '#94a3b8',
                  borderRadius: '10px', padding: '0 5px', fontSize: '.75rem', fontWeight: 700,
                }}>{stats[type]}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Liste acteurs (scrollable) ─── */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '28px', height: '28px', margin: '0 auto 12px',
                border: '2px solid #e2e8f0', borderTop: '2px solid #6366f1',
                borderRadius: '50%', animation: 'spin 1s linear infinite',
              }} />
              <p style={{ fontSize: '.875rem', color: '#94a3b8' }}>Chargement…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredActeurs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '.875rem' }}>
              Aucun acteur pour cette sélection
            </div>
          ) : (
            filteredActeurs.map((a) => {
              const cfg = TYPE_CONFIG[a.type];
              const isSelected = selectedActeur?.id === a.id;
              return (
                <button key={a.id}
                  onClick={() => {
                    setSelectedActeur(a);
                    if (a.lat && a.lng && mapRef.current) {
                      mapRef.current.flyTo([a.lat, a.lng], 15, { duration: 0.6 });
                      setMobileView('map');
                    }
                  }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '12px 16px',
                    background: isSelected ? '#eef2ff' : 'white',
                    borderBottom: '1px solid #f8fafc',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                    transition: 'all .1s ease',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'white'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '.75rem' }}>{cfg?.emoji}</span>
                      </div>
                      <div style={{
                        fontWeight: 600, fontSize: '.9375rem', color: '#1e293b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{a.name}</div>
                      <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '1px' }}>{a.commune}</div>
                    </div>
                    {a.google_rating && (
                      <div style={{ fontSize: '.8125rem', color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>
                        ★ {Number(a.google_rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ─── Communes par tier ─── */}
        {!communeObj && (
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 16px' }}>
            {[
              { tier: 'premium',   label: 'Premium',   color: '#4338ca', bg: '#eef2ff' },
              { tier: 'equilibre', label: 'Équilibré', color: '#0369a1', bg: '#e0f2fe' },
              { tier: 'emergent',  label: 'Émergent',  color: '#047857', bg: '#d1fae5' },
            ].map(({ tier, label, color, bg }) => (
              <div key={tier} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {COMMUNES.filter(c => c.tier === tier).map(c => (
                    <button key={c.slug} onClick={() => goToCommune(c.slug)} style={{
                      fontSize: '.8125rem', padding: '3px 10px', borderRadius: '20px',
                      background: bg, color, border: 'none', cursor: 'pointer',
                      fontWeight: 600, transition: 'opacity .15s', minHeight: 'auto',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.7'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── CTA bas panneau ─── */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: '8px',
        }}>
          <Link href="/evaluer" style={{
            flex: 1, textAlign: 'center', textDecoration: 'none',
            background: '#6366f1', color: 'white',
            fontWeight: 700, fontSize: '.9375rem', padding: '10px 8px',
            borderRadius: '12px', transition: 'background .15s ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4338ca'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#6366f1'; }}
          >
            🏡 Estimer mon bien
          </Link>
          <Link href="/pro/rejoindre" style={{
            flex: 1, textAlign: 'center', textDecoration: 'none',
            background: '#f8fafc', color: '#334155',
            fontWeight: 600, fontSize: '.9375rem', padding: '10px 8px',
            borderRadius: '12px', border: '1.5px solid #e2e8f0', transition: 'background .15s ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
          >
            🏢 Espace Pro
          </Link>
        </div>
      </div>

      {/* ═══════════════════════ CARTE ═══════════════════════ */}
      <div
        style={{ flex: 1, position: 'relative', cursor: mapActive ? 'crosshair' : 'grab' }}
        className={mobileView === 'list' ? 'hidden-mobile' : ''}
        onMouseLeave={deactivateMap}
        onWheel={handleMapWheel}
      >
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        {/* ── Overlay "cliquez pour activer" ── */}
        {!mapActive && (
          <div
            onClick={activateMap}
            style={{
              position: 'absolute', inset: 0, zIndex: 500,
              cursor: 'pointer', background: 'transparent',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: '80px',
              pointerEvents: 'auto',
            }}
          >
            <div style={{
              background: 'rgba(15,23,42,0.75)',
              backdropFilter: 'blur(6px)',
              color: 'white', borderRadius: '16px', padding: '10px 20px',
              fontSize: '.9375rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,.3)',
              transition: 'opacity .2s',
              pointerEvents: 'none',
            }}>
              🖱️ Cliquez sur la carte pour zoomer librement
            </div>
          </div>
        )}

        {/* ── Hint Ctrl+scroll ── */}
        {showHint && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15,23,42,0.82)', color: 'white',
            borderRadius: '14px', padding: '12px 22px',
            fontSize: '1rem', fontWeight: 600, zIndex: 600,
            pointerEvents: 'none', textAlign: 'center', lineHeight: 1.5,
          }}>
            🖱️ Cliquez d&apos;abord sur la carte<br />
            <span style={{ fontSize: '.875rem', fontWeight: 400, opacity: .8 }}>pour activer le zoom à la molette</span>
          </div>
        )}

        {/* ── Stats bar ── */}
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 400, display: 'flex', gap: '10px',
          background: 'white', borderRadius: '100px',
          boxShadow: '0 2px 12px rgba(0,0,0,.1)', padding: '6px 16px',
          border: '1px solid #f1f5f9', whiteSpace: 'nowrap',
          fontSize: '.8125rem', color: '#64748b', fontWeight: 500,
          pointerEvents: 'none',
        }}>
          <span>📍 {COMMUNES.length} communes</span>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <span>🏢 {stats.agence ?? '…'} agences</span>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <span>⚖️ {stats.notaire ?? '…'} notaires</span>
        </div>

        {/* ── Légende ── */}
        <div style={{
          position: 'absolute', bottom: '70px', right: '12px', zIndex: 400,
          background: 'white', borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,.1)', padding: '10px 14px',
          border: '1px solid #f1f5f9', fontSize: '.8125rem',
        }}>
          {(Object.entries(TYPE_CONFIG) as [ActeurType, typeof TYPE_CONFIG[ActeurType]][]).map(([, cfg]) => (
            <div key={cfg.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
              <span style={{ color: '#475569' }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* ── Fiche acteur sélectionné ── */}
        {selectedActeur && (
          <div style={{
            position: 'absolute', bottom: '70px', left: '12px',
            width: '300px', maxWidth: 'calc(100% - 24px)',
            background: 'white', borderRadius: '18px',
            boxShadow: '0 8px 32px rgba(0,0,0,.14)',
            padding: '18px', zIndex: 600,
            border: '1px solid #f1f5f9',
            animation: 'fadeInUp .2s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '.8125rem', color: '#94a3b8' }}>
                    {TYPE_CONFIG[selectedActeur.type]?.emoji} {TYPE_CONFIG[selectedActeur.type]?.label.slice(0, -1)}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', lineHeight: 1.3 }}>
                  {selectedActeur.name}
                </div>
                {selectedActeur.commune && (
                  <div style={{ fontSize: '.875rem', color: '#64748b', marginTop: '2px' }}>{selectedActeur.commune}</div>
                )}
                {selectedActeur.google_rating && (
                  <div style={{ fontSize: '.875rem', color: '#f59e0b', fontWeight: 700, marginTop: '6px' }}>
                    ★ {Number(selectedActeur.google_rating).toFixed(1)}
                    <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '4px' }}>
                      ({selectedActeur.google_reviews} avis)
                    </span>
                  </div>
                )}
                {selectedActeur.address && (
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {selectedActeur.address}
                  </div>
                )}
                {selectedActeur.type === 'diagnostiqueur' && Array.isArray(selectedActeur.meta?.services) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {(selectedActeur.meta.services as string[]).slice(0, 4).map(s => (
                      <span key={s} style={{
                        fontSize: '.75rem', background: '#fef3c7', color: '#92400e',
                        padding: '2px 7px', borderRadius: '6px',
                      }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedActeur(null)} style={{
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', color: '#64748b', minHeight: 'auto',
              }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {selectedActeur.phone && (
                <a href={`tel:${selectedActeur.phone}`} style={{
                  flex: 1, textAlign: 'center', textDecoration: 'none',
                  background: '#6366f1', color: 'white',
                  fontWeight: 700, fontSize: '.9375rem', padding: '10px',
                  borderRadius: '12px',
                }}>
                  📞 Appeler
                </a>
              )}
              {selectedActeur.website && (
                <a href={selectedActeur.website} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, textAlign: 'center', textDecoration: 'none',
                  background: '#f8fafc', color: '#334155',
                  fontWeight: 600, fontSize: '.9375rem', padding: '10px',
                  borderRadius: '12px', border: '1.5px solid #e2e8f0',
                }}>
                  Site web →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════ MOBILE : toggle Liste / Carte ═══════════════════════ */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 700,
        background: 'white', borderRadius: '100px',
        boxShadow: '0 4px 20px rgba(0,0,0,.15)',
        border: '1px solid #e2e8f0',
        display: 'flex', overflow: 'hidden',
      }} className="show-mobile-only">
        <button onClick={() => setMobileView('list')} style={{
          padding: '12px 24px', border: 'none', cursor: 'pointer', fontWeight: 700,
          fontSize: '.9375rem', transition: 'all .15s',
          background: mobileView === 'list' ? '#0f172a' : 'white',
          color: mobileView === 'list' ? 'white' : '#94a3b8',
          minHeight: 'auto', borderRadius: 0,
        }}>
          ☰ Liste
        </button>
        <button onClick={() => { setMobileView('map'); setTimeout(() => mapRef.current?.invalidateSize(), 100); }} style={{
          padding: '12px 24px', border: 'none', cursor: 'pointer', fontWeight: 700,
          fontSize: '.9375rem', transition: 'all .15s',
          background: mobileView === 'map' ? '#0f172a' : 'white',
          color: mobileView === 'map' ? 'white' : '#94a3b8',
          minHeight: 'auto', borderRadius: 0,
        }}>
          🗺️ Carte
        </button>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .map-left-panel { width: 100% !important; }
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 768px) {
          .show-mobile-only { display: none !important; }
          .map-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
