'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import Link from 'next/link';

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

// ─── FEATURES ────────────────────────────────────────────────
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
    href: '/?carte=1',
    color: '#0ea5e9',
  },
  {
    icon: '🏡',
    title: 'Vous avez un bien',
    desc: 'Estimez votre bien gratuitement avec les données DVF officielles. Fourchette de prix en 2 minutes.',
    cta: 'Estimer mon bien',
    href: '/evaluer',
    color: '#10b981',
  },
  {
    icon: '🏢',
    title: 'Vous êtes un pro',
    desc: 'Agences, notaires — rejoignez la plateforme locale et accédez aux profils acquéreurs de votre commune.',
    cta: 'Rejoindre Terrimo',
    href: '/pro/rejoindre',
    color: '#8b5cf6',
  },
];

const STATS = [
  { n: '135+', label: 'agences & notaires' },
  { n: '12',   label: 'communes' },
  { n: 'DVF',  label: 'données officielles' },
  { n: '100%', label: 'local' },
];

// ─── PAGE ────────────────────────────────────────────────────
export default function Home() {
  const [mapFullscreen, setMapFullscreen] = useState(false);

  if (mapFullscreen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 68px)', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Suspense><TerrimoMap autoScrollZoom /></Suspense>
          <button
            onClick={() => setMapFullscreen(false)}
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

  return (
    <main style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO — Zone-first
      ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(48px, 9vh, 96px) 24px clamp(40px, 7vh, 72px)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Fond animé */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -60,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(16,185,129,.07) 0%, transparent 70%)',
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

        {/* Headline principale */}
        <h1 style={{
          fontSize: 'clamp(2.125rem, 5.5vw, 3.75rem)',
          fontWeight: 900,
          color: 'white',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          maxWidth: 760,
          margin: '0 auto 22px',
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

        {/* Sous-titre */}
        <p style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.1875rem)',
          color: 'rgba(255,255,255,.5)',
          lineHeight: 1.75,
          maxWidth: 520,
          margin: '0 auto 44px',
        }}>
          La première plateforme immobilière du Bassin d'Arcachon où vous dessinez votre zone idéale directement sur la carte.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setMapFullscreen(true)}
            style={{
              padding: '15px 32px', borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: 800, fontSize: '1rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(99,102,241,.4)',
              display: 'flex', alignItems: 'center', gap: 8,
              letterSpacing: '-.01em',
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
          ZONE SEARCH — Banner (style Idealista)
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(99,102,241,.2)',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'clamp(240px, 40%, 380px) 1fr',
          }}>
            {/* Carte illustrée — aperçu zone dessinée */}
            <div style={{
              position: 'relative', background: '#1e2d3d', minHeight: 220,
              overflow: 'hidden',
            }}>
              {/* SVG illustrant une zone dessinée sur le bassin */}
              <svg viewBox="0 0 380 240" xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', display: 'block' }}>
                {/* Fond carte sombre */}
                <rect width="380" height="240" fill="#1a2e44"/>
                {/* Routes approximatives */}
                <line x1="0" y1="80" x2="380" y2="95" stroke="#243a52" strokeWidth="8"/>
                <line x1="0" y1="140" x2="380" y2="155" stroke="#243a52" strokeWidth="6"/>
                <line x1="80" y1="0" x2="100" y2="240" stroke="#243a52" strokeWidth="5"/>
                <line x1="200" y1="0" x2="220" y2="240" stroke="#243a52" strokeWidth="4"/>
                <line x1="310" y1="0" x2="320" y2="240" stroke="#243a52" strokeWidth="4"/>
                {/* Bassin eau */}
                <ellipse cx="320" cy="180" rx="100" ry="80" fill="#16304d" opacity=".9"/>
                {/* Zone dessinée 1 — rose/violet */}
                <polygon points="40,30 160,20 175,90 120,120 30,110" fill="#6366f1" fillOpacity=".2" stroke="#818cf8" strokeWidth="2.5" strokeDasharray="none"/>
                {/* Points du polygone 1 */}
                <circle cx="40" cy="30" r="5" fill="#818cf8"/>
                <circle cx="160" cy="20" r="5" fill="#818cf8"/>
                <circle cx="175" cy="90" r="5" fill="#818cf8"/>
                <circle cx="120" cy="120" r="5" fill="#818cf8"/>
                <circle cx="30" cy="110" r="5" fill="#818cf8"/>
                {/* Zone dessinée 2 */}
                <polygon points="200,50 310,40 330,130 250,145 190,110" fill="#6366f1" fillOpacity=".18" stroke="#818cf8" strokeWidth="2.5"/>
                <circle cx="200" cy="50" r="5" fill="#818cf8"/>
                <circle cx="310" cy="40" r="5" fill="#818cf8"/>
                <circle cx="330" cy="130" r="5" fill="#818cf8"/>
                <circle cx="250" cy="145" r="5" fill="#818cf8"/>
                <circle cx="190" cy="110" r="5" fill="#818cf8"/>
                {/* Marqueurs biens dans les zones */}
                <circle cx="80" cy="65" r="7" fill="#f97316" opacity=".9"/>
                <circle cx="130" cy="55" r="7" fill="#f97316" opacity=".9"/>
                <circle cx="90" cy="95" r="7" fill="#3b82f6" opacity=".9"/>
                <circle cx="240" cy="80" r="7" fill="#f97316" opacity=".9"/>
                <circle cx="280" cy="95" r="7" fill="#f97316" opacity=".9"/>
                <circle cx="260" cy="120" r="7" fill="#3b82f6" opacity=".9"/>
                {/* Gradient overlay bas */}
                <defs>
                  <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="60%" stopColor="#1a2e44" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#1a2e44" stopOpacity=".6"/>
                  </linearGradient>
                </defs>
                <rect width="380" height="240" fill="url(#fadeBottom)"/>
              </svg>
              {/* Badge "2 zones sélectionnées" */}
              <div style={{
                position: 'absolute', top: 14, left: 14,
                background: '#6366f1', color: 'white',
                borderRadius: 20, padding: '4px 12px',
                fontSize: '.75rem', fontWeight: 700,
                boxShadow: '0 2px 10px rgba(99,102,241,.5)',
              }}>
                ✏️ 2 zones actives
              </div>
            </div>

            {/* Contenu texte */}
            <div style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em',
                color: '#818cf8', marginBottom: 14,
              }}>
                NOUVEAU · DRAW SEARCH
              </div>
              <h2 style={{
                color: 'white', fontWeight: 800,
                fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
                lineHeight: 1.2, marginBottom: 14, letterSpacing: '-.02em',
              }}>
                Sélectionnez des zones<br />sur la carte
              </h2>
              <p style={{
                color: 'rgba(255,255,255,.5)',
                fontSize: '.9375rem', lineHeight: 1.7,
                marginBottom: 28, maxWidth: 400,
              }}>
                Dessinez votre périmètre idéal directement sur la carte du Bassin. Filtrez instantanément tous les biens disponibles dans votre zone — sans saisir d'adresse.
              </p>
              <button
                onClick={() => setMapFullscreen(true)}
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 24px', borderRadius: 12,
                  background: 'rgba(99,102,241,.15)',
                  border: '1.5px solid rgba(99,102,241,.4)',
                  color: '#a5b4fc', fontWeight: 700, fontSize: '.9375rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,.25)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,.15)';
                  (e.currentTarget as HTMLElement).style.color = '#a5b4fc';
                }}
              >
                Commencer à dessiner →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CARTE PREVIEW
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 56px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.06)',
          position: 'relative',
          height: 'clamp(300px, 45vh, 480px)',
          boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}>
          <Suspense><TerrimoMap /></Suspense>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,22,40,.9) 0%, transparent 35%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 24, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 12,
            pointerEvents: 'none',
          }}>
            <button
              onClick={() => setMapFullscreen(true)}
              style={{
                padding: '11px 22px', borderRadius: 12,
                background: 'rgba(255,255,255,.95)', border: 'none',
                color: '#0a1628', fontWeight: 700, fontSize: '.875rem',
                cursor: 'pointer', pointerEvents: 'all',
                boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              ⛶ Plein écran
            </button>
          </div>
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(10,22,40,.85)', backdropFilter: 'blur(12px)',
            borderRadius: 10, padding: '7px 14px',
            fontSize: '.8125rem', color: 'rgba(255,255,255,.65)', fontWeight: 500,
            border: '1px solid rgba(255,255,255,.07)',
            pointerEvents: 'none',
          }}>
            🗺 Agences · Biens · DVF
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — 3 différenciateurs
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,.03)',
                border: `1px solid ${f.color}28`,
                borderRadius: 18, padding: '28px 26px',
                borderTop: `3px solid ${f.color}`,
              }}>
                <div style={{
                  fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.1em',
                  color: f.color, marginBottom: 14,
                }}>
                  {f.tag}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.emoji}</div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 10 }}>
                  {f.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem', lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PERSONAS
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {PERSONAS.map(p => (
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
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 10 }}>
                  {p.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem', lineHeight: 1.65, marginBottom: 20 }}>
                  {p.desc}
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: p.color, fontWeight: 700, fontSize: '.875rem',
                }}>
                  {p.cta} →
                </span>
              </Link>
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
            onClick={() => setMapFullscreen(true)}
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

    </main>
  );
}
