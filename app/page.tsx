'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { COMMUNES } from '@/lib/communes';

const TerrimoMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 100%)',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid rgba(255,255,255,.12)',
        borderTop: '3px solid #38bdf8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

// ─── DATA ─────────────────────────────────────────────────────
const FEATURES = [
  {
    emoji: '✏️',
    title: 'Cherchez par zone',
    desc: 'Dessinez votre zone idéale directement sur la carte. Nos algorithmes filtrent instantanément tous les biens dans votre périmètre.',
    color: '#6366f1',
    tag: 'EXCLUSIF TERRIMO',
  },
  {
    emoji: '🔒',
    title: 'Localisation protégée',
    desc: 'Les vendeurs choisissent de révéler leur adresse uniquement aux acheteurs sérieux. Créez un compte pour accéder aux détails.',
    color: '#f59e0b',
    tag: 'ANTI-DÉMARCHAGE',
  },
  {
    emoji: '📊',
    title: 'Prix DVF officiels',
    desc: 'Chaque bien est contextualisé avec les données DVF (transactions notariées réelles) de la zone — aucun portail ne le fait.',
    color: '#10b981',
    tag: 'DONNÉES OFFICIELLES',
  },
];

const PERSONAS = [
  {
    icon: '🔍',
    title: 'Vous cherchez un bien',
    desc: 'Dessinez votre zone sur la carte. Les agences du Bassin vous contactent dès qu\'un bien correspond.',
    cta: 'Explorer la carte',
    href: '/?ouvre-carte=1',
    color: '#0ea5e9',
    isMapCta: true,
  },
  {
    icon: '🏡',
    title: 'Vous avez un bien',
    desc: 'Estimez votre bien gratuitement avec les données DVF officielles. Fourchette de prix en 2 minutes.',
    cta: 'Estimer mon bien',
    href: '/evaluer',
    color: '#10b981',
    isMapCta: false,
  },
  {
    icon: '🏢',
    title: 'Vous êtes un pro',
    desc: 'Agences, notaires, diagnostiqueurs — rejoignez la plateforme locale et accédez aux profils acquéreurs de votre commune.',
    cta: 'Rejoindre Terrimo',
    href: '/pro/rejoindre',
    color: '#8b5cf6',
    isMapCta: false,
  },
];

const STATS = [
  { n: '135+', label: 'agences & notaires' },
  { n: '12',   label: 'communes' },
  { n: 'DVF',  label: 'données officielles' },
  { n: '100%', label: 'local' },
];

const TYPES_BIEN = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Chalet', 'Immeuble'];
const BUDGETS_ACHAT = [
  { label: 'Sans limite', value: '' },
  { label: '< 250 000 €', value: '250000' },
  { label: '< 400 000 €', value: '400000' },
  { label: '< 600 000 €', value: '600000' },
  { label: '< 900 000 €', value: '900000' },
  { label: '< 1 500 000 €', value: '1500000' },
  { label: '> 1 500 000 €', value: '2000000' },
];
const BUDGETS_LOCATION = [
  { label: 'Sans limite', value: '' },
  { label: '< 800 €/mois', value: '800' },
  { label: '< 1 200 €/mois', value: '1200' },
  { label: '< 2 000 €/mois', value: '2000' },
  { label: '< 3 500 €/mois', value: '3500' },
  { label: '< 5 000 €/mois', value: '5000' },
];
const SURFACES = [
  { label: 'Sans min', value: '' },
  { label: '> 30 m²', value: '30' },
  { label: '> 50 m²', value: '50' },
  { label: '> 80 m²', value: '80' },
  { label: '> 120 m²', value: '120' },
  { label: '> 180 m²', value: '180' },
];

const SELECT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(255,255,255,.06)',
  border: '1.5px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  color: 'white',
  fontSize: '.9375rem',
  fontWeight: 500,
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color .15s',
};

// ─── PAGE ─────────────────────────────────────────────────────
export default function Home() {
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [mapDrawMode, setMapDrawMode]     = useState(false);

  // Onglets recherche
  const [searchTab, setSearchTab]         = useState<'Acheter' | 'Louer' | 'Estimer'>('Acheter');
  const [searchCommune, setSearchCommune] = useState('');
  const [searchType, setSearchType]       = useState('');
  const [searchBudget, setSearchBudget]   = useState('');
  const [searchSurface, setSearchSurface] = useState('');

  // Ouvre la carte si URL param ?ouvre-carte=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ouvre-carte') === '1') {
      setMapFullscreen(true);
    }
  }, []);

  const handleSearch = () => {
    if (searchTab === 'Estimer') {
      const url = searchCommune ? `/evaluer?commune=${searchCommune}` : '/evaluer';
      window.location.href = url;
      return;
    }
    setMapDrawMode(false);
    setMapFullscreen(true);
  };

  // ── Mode carte plein écran ─────────────────────────────────
  if (mapFullscreen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 68px)', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Suspense><TerrimoMap autoScrollZoom autoDrawMode={mapDrawMode} /></Suspense>
          <button
            onClick={() => { setMapFullscreen(false); setMapDrawMode(false); }}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 1000,
              background: 'white', border: 'none', borderRadius: 10,
              padding: '8px 16px', fontSize: '.875rem', fontWeight: 600,
              color: '#0f1923', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.15)',
            }}
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // ── Landing page ───────────────────────────────────────────
  return (
    <main style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(48px, 9vh, 96px) 24px clamp(40px, 7vh, 72px)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.3)',
          borderRadius: 100, padding: '5px 16px', marginBottom: 32,
          fontSize: '.8125rem', fontWeight: 700, color: '#a5b4fc',
          letterSpacing: '.06em',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', display: 'inline-block', boxShadow: '0 0 8px #6366f1' }} />
          BASSIN D'ARCACHON · SEARCH BY ZONE
        </div>

        <h1 style={{
          fontSize: 'clamp(2.125rem, 5.5vw, 3.75rem)',
          fontWeight: 900, color: 'white',
          lineHeight: 1.05, letterSpacing: '-0.03em',
          maxWidth: 760, margin: '0 auto 22px',
        }}>
          Cherchez par zone,{' '}
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #818cf8, #6366f1 40%, #4f46e5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            pas par adresse
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.1875rem)',
          color: 'rgba(255,255,255,.5)',
          lineHeight: 1.75, maxWidth: 520,
          margin: '0 auto 44px',
        }}>
          La première plateforme immobilière du Bassin d'Arcachon où vous dessinez votre zone idéale directement sur la carte.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setMapDrawMode(true); setMapFullscreen(true); }}
            style={{
              padding: '15px 32px', borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: 800, fontSize: '1rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(99,102,241,.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            ✏️ Dessiner ma zone
          </button>
          <Link href="/evaluer" style={{
            padding: '15px 28px', borderRadius: 14,
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            color: 'rgba(255,255,255,.8)', fontWeight: 600, fontSize: '1rem',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            Estimer mon bien →
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 36px',
          marginTop: 56, opacity: .7,
        }}>
          {STATS.map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{s.n}</div>
              <div style={{ fontSize: '.6875rem', color: 'rgba(255,255,255,.4)', marginTop: 2, letterSpacing: '.04em' }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MOTEUR DE RECHERCHE
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 56px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 24, padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: '0 32px 80px rgba(0,0,0,.4)',
          }}>
            {/* Onglets */}
            <div style={{
              display: 'flex', gap: 4, marginBottom: 28,
              background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: 4,
              width: 'fit-content',
            }}>
              {(['Acheter', 'Louer', 'Estimer'] as const).map(tab => (
                <button key={tab} onClick={() => setSearchTab(tab)} style={{
                  padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: '.9rem', fontWeight: 700,
                  background: searchTab === tab ? 'white' : 'transparent',
                  color: searchTab === tab ? '#0a1628' : 'rgba(255,255,255,.5)',
                  transition: 'all .12s',
                }}>{tab}</button>
              ))}
            </div>

            {/* Champs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12, marginBottom: 20,
            }}>
              {/* Commune */}
              <div>
                <label style={{ fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                  COMMUNE
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={searchCommune}
                    onChange={e => setSearchCommune(e.target.value)}
                    style={SELECT_STYLE}
                    onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#6366f1'; }}
                    onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,.1)'; }}
                  >
                    <option value="">Toutes les communes</option>
                    {COMMUNES.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {/* Type de bien */}
              {searchTab !== 'Estimer' && (
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                    TYPE DE BIEN
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={searchType}
                      onChange={e => setSearchType(e.target.value)}
                      style={SELECT_STYLE}
                      onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#6366f1'; }}
                      onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,.1)'; }}
                    >
                      <option value="">Tous les types</option>
                      {TYPES_BIEN.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              )}

              {/* Budget */}
              {searchTab !== 'Estimer' && (
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                    {searchTab === 'Acheter' ? 'BUDGET MAX' : 'LOYER MAX'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={searchBudget}
                      onChange={e => setSearchBudget(e.target.value)}
                      style={SELECT_STYLE}
                      onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#6366f1'; }}
                      onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,.1)'; }}
                    >
                      {(searchTab === 'Acheter' ? BUDGETS_ACHAT : BUDGETS_LOCATION).map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              )}

              {/* Surface */}
              {searchTab !== 'Estimer' && (
                <div>
                  <label style={{ fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                    SURFACE MIN
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={searchSurface}
                      onChange={e => setSearchSurface(e.target.value)}
                      style={SELECT_STYLE}
                      onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#6366f1'; }}
                      onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,.1)'; }}
                    >
                      {SURFACES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              )}

              {/* Estimer : infos proprio */}
              {searchTab === 'Estimer' && (
                <>
                  <div>
                    <label style={{ fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                      TYPE DE BIEN
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={searchType} onChange={e => setSearchType(e.target.value)} style={SELECT_STYLE}
                        onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#10b981'; }}
                        onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,.1)'; }}>
                        <option value="">Tous les types</option>
                        {TYPES_BIEN.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '.7rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
                      SURFACE APPROX.
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={searchSurface} onChange={e => setSearchSurface(e.target.value)} style={SELECT_STYLE}
                        onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#10b981'; }}
                        onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,.1)'; }}>
                        {SURFACES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* CTA Recherche */}
            <button
              onClick={handleSearch}
              style={{
                width: '100%', padding: '15px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: searchTab === 'Estimer'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: 800, fontSize: '1.0625rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: searchTab === 'Estimer'
                  ? '0 8px 28px rgba(16,185,129,.35)'
                  : '0 8px 28px rgba(99,102,241,.4)',
                transition: 'all .15s',
                letterSpacing: '-.01em',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              {searchTab === 'Estimer' ? (
                <><span>🏷️</span> Estimer gratuitement</>
              ) : (
                <><span>🗺️</span> Voir les biens sur la carte</>
              )}
            </button>

            {/* Lien dessin zone */}
            {searchTab !== 'Estimer' && (
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.8125rem', color: 'rgba(255,255,255,.3)' }}>
                ou{' '}
                <button
                  onClick={() => { setMapDrawMode(true); setMapFullscreen(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600, fontSize: '.8125rem', padding: 0, textDecoration: 'underline' }}
                >
                  dessiner ma zone sur la carte ✏️
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', color: 'white',
            fontSize: 'clamp(1.375rem, 3vw, 2rem)',
            fontWeight: 800, marginBottom: 12,
            letterSpacing: '-0.02em',
          }}>
            Une approche radicalement différente
          </h2>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,.4)',
            fontSize: '.9375rem', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px',
          }}>
            Pas un portail de plus. Une plateforme construite pour le Bassin d'Arcachon, avec des fonctionnalités introuvables ailleurs.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,.03)',
                border: `1px solid ${f.color}28`,
                borderRadius: 18, padding: '28px 26px',
                borderTop: `3px solid ${f.color}`,
              }}>
                <div style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.1em', color: f.color, marginBottom: 14 }}>
                  {f.tag}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.emoji}</div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PERSONAS — CTA pour chaque profil
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', color: 'white',
            fontSize: 'clamp(1.375rem, 3vw, 2rem)',
            fontWeight: 800, marginBottom: 40,
            letterSpacing: '-0.02em',
          }}>
            Vous êtes…
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {PERSONAS.map(p => (
              p.isMapCta ? (
                <button
                  key={p.title}
                  onClick={() => setMapFullscreen(true)}
                  style={{
                    display: 'block', textAlign: 'left', width: '100%',
                    background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 18, padding: '26px 24px',
                    transition: 'transform .15s, border-color .15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.borderColor = p.color + '50';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 14 }}>{p.icon}</div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 10 }}>{p.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem', lineHeight: 1.65, marginBottom: 20 }}>{p.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: p.color, fontWeight: 700, fontSize: '.875rem' }}>
                    {p.cta} →
                  </span>
                </button>
              ) : (
                <Link key={p.href} href={p.href} style={{
                  display: 'block', textDecoration: 'none',
                  background: 'rgba(255,255,255,.025)',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 18, padding: '26px 24px',
                  transition: 'transform .15s, border-color .15s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.borderColor = p.color + '50';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 14 }}>{p.icon}</div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 10 }}>{p.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem', lineHeight: 1.65, marginBottom: 20 }}>{p.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: p.color, fontWeight: 700, fontSize: '.875rem' }}>
                    {p.cta} →
                  </span>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER CTA
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 72px' }}>
        <div style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,.12), rgba(99,102,241,.04))',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 24, padding: 'clamp(36px, 6vw, 60px) 32px',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✏️</div>
          <h2 style={{
            color: 'white', fontWeight: 800,
            fontSize: 'clamp(1.375rem, 3vw, 1.875rem)',
            marginBottom: 14, letterSpacing: '-.02em',
          }}>
            Dessinez votre projet immobilier
          </h2>
          <p style={{
            color: 'rgba(255,255,255,.45)', fontSize: '.9375rem',
            lineHeight: 1.7, marginBottom: 32, maxWidth: 460, margin: '0 auto 32px',
          }}>
            Cliquez sur la carte, délimitez votre zone idéale, et découvrez tous les biens disponibles dans votre périmètre — en temps réel.
          </p>
          <button
            onClick={() => { setMapDrawMode(true); setMapFullscreen(true); }}
            style={{
              padding: '15px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: 800, fontSize: '1rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(99,102,241,.4)',
              letterSpacing: '-.01em',
            }}
          >
            Commencer sur la carte →
          </button>
        </div>
      </section>

      <style>{`
        option { background: #0f1f35; color: white; }
      `}</style>
    </main>
  );
}
