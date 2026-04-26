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

// ─── PERSONAS ────────────────────────────────────────────────
const PERSONAS = [
  {
    icon: '🔍',
    title: 'Vous cherchez un bien',
    desc: 'Créez votre alerte de recherche. Les agences du Bassin vous contactent dès qu\'un bien correspond à votre profil.',
    cta: 'Créer mon alerte',
    href: '/rechercher',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,.08)',
    border: 'rgba(14,165,233,.2)',
  },
  {
    icon: '🏡',
    title: 'Vous avez un bien',
    desc: 'Estimez votre bien gratuitement grâce aux données DVF officielles. Obtenez une fourchette de prix en 2 minutes.',
    cta: 'Estimer mon bien',
    href: '/evaluer',
    color: '#10b981',
    bg: 'rgba(16,185,129,.08)',
    border: 'rgba(16,185,129,.2)',
  },
  {
    icon: '🏢',
    title: 'Vous êtes un pro',
    desc: 'Agences, notaires, diagnostiqueurs — rejoignez la plateforme et accédez aux profils acquéreurs de votre commune.',
    cta: 'Rejoindre Terrimo',
    href: '/pro/rejoindre',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,.08)',
    border: 'rgba(139,92,246,.2)',
  },
];

const STATS = [
  { n: '135+', label: 'agences & notaires' },
  { n: '12',   label: 'communes du Bassin' },
  { n: 'DVF',  label: 'données officielles' },
  { n: '100%', label: 'local & indépendant' },
];

// ─── PAGE ────────────────────────────────────────────────────
export default function Home() {
  const [mapFullscreen, setMapFullscreen] = useState(false);

  if (mapFullscreen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 68px)', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Suspense><TerrimoMap /></Suspense>
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
    <main style={{ background: '#0f1923', minHeight: 'calc(100dvh - 68px)' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(60px, 10vh, 100px) 24px clamp(50px, 8vh, 80px)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Orbes décoratifs */}
        <div style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(14,165,233,.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -80,
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(93,255,211,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(14,165,233,.12)', border: '1px solid rgba(14,165,233,.25)',
          borderRadius: 100, padding: '5px 16px', marginBottom: 28,
          fontSize: '.8125rem', fontWeight: 600, color: '#38bdf8',
          letterSpacing: '.04em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
          BASSIN D'ARCACHON · EXCLUSIVEMENT
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: 720,
          margin: '0 auto 20px',
        }}>
          L'immobilier du Bassin,{' '}
          <span style={{
            background: 'linear-gradient(90deg, #38bdf8, #5dffd3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            cartographié
          </span>
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
          color: 'rgba(255,255,255,.55)',
          lineHeight: 1.7,
          maxWidth: 560,
          margin: '0 auto 40px',
        }}>
          Acheteurs, propriétaires, agences — une seule plateforme transparente pour tout l'immobilier du Bassin d'Arcachon.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setMapFullscreen(true)}
            style={{
              padding: '14px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: 'white', fontWeight: 700, fontSize: '1rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(14,165,233,.35)',
            }}
          >
            🗺 Explorer la carte
          </button>
          <Link href="/evaluer" style={{
            padding: '14px 28px', borderRadius: 12,
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
            color: 'white', fontWeight: 600, fontSize: '1rem',
            textDecoration: 'none',
          }}>
            Estimer mon bien →
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 32px',
          marginTop: 52,
        }}>
          {STATS.map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white' }}>{s.n}</div>
              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CARTE INVITATION ─────────────────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.08)',
          position: 'relative',
          height: 'clamp(340px, 50vh, 520px)',
          boxShadow: '0 24px 80px rgba(0,0,0,.5)',
        }}>
          <Suspense><TerrimoMap /></Suspense>

          {/* Overlay gradient bas */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(15,25,35,.85) 0%, transparent 40%)',
            pointerEvents: 'none',
          }} />

          {/* CTA plein écran */}
          <div style={{
            position: 'absolute', bottom: 24, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <button
              onClick={() => setMapFullscreen(true)}
              style={{
                padding: '12px 24px', borderRadius: 12,
                background: 'white', border: 'none',
                color: '#0f1923', fontWeight: 700, fontSize: '.9375rem',
                cursor: 'pointer', pointerEvents: 'all',
                boxShadow: '0 4px 16px rgba(0,0,0,.3)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span>Ouvrir la carte en plein écran</span>
              <span style={{ fontSize: '1.1rem' }}>⛶</span>
            </button>
          </div>

          {/* Label top-left */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(15,25,35,.8)', backdropFilter: 'blur(8px)',
            borderRadius: 8, padding: '6px 12px',
            fontSize: '.8125rem', color: 'rgba(255,255,255,.7)', fontWeight: 500,
            border: '1px solid rgba(255,255,255,.08)',
            pointerEvents: 'none',
          }}>
            🗺 Agences · Biens · Quartiers · Données DVF
          </div>
        </div>
      </section>

      {/* ── PERSONAS ──────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', color: 'white',
            fontSize: 'clamp(1.375rem, 3vw, 2rem)',
            fontWeight: 700, marginBottom: 40,
            letterSpacing: '-0.01em',
          }}>
            Terrimo pour tout le monde
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {PERSONAS.map(p => (
              <Link key={p.href} href={p.href} style={{
                display: 'block', textDecoration: 'none',
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: 16, padding: 28,
                transition: 'transform .15s, box-shadow .15s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${p.bg}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '2.25rem', marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem', marginBottom: 10 }}>
                  {p.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9375rem', lineHeight: 1.65, marginBottom: 20 }}>
                  {p.desc}
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: p.color, fontWeight: 700, fontSize: '.9375rem',
                }}>
                  {p.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
