'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
const TerrimoMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 100%)',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(255,255,255,.15)',
        borderTop: '3px solid #38bdf8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '14px',
      }} />
      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9375rem' }}>Chargement de la carte…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      {/*
        Layout full-viewport : la carte + liste EST le produit.
        Aucun scroll de page — seul le panneau liste scrolle à l'intérieur.
        height = 100dvh - 68px (hauteur nav)
      */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - 68px)',
        overflow: 'hidden',
      }}>

        {/* ── Bande intro (desktop uniquement) ─────────────────── */}
        <div
          className="hide-mobile"
          style={{
            background: 'linear-gradient(90deg, #0c1a2e 0%, #0f3460 100%)',
            padding: '10px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(56,189,248,.15)',
              border: '1px solid rgba(56,189,248,.25)',
              borderRadius: '100px', padding: '4px 12px',
            }}>
              <span style={{ color: '#38bdf8', fontSize: '.8125rem', fontWeight: 700 }}>
                🌊 Bassin d&apos;Arcachon
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem', margin: 0 }}>
              Carte interactive · Prix réels · 135 professionnels
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/evaluer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#38bdf8', color: '#0c1a2e',
              fontWeight: 800, fontSize: '.875rem',
              padding: '8px 18px', borderRadius: '10px',
              textDecoration: 'none', minHeight: 'auto',
            }}>
              🏡 Estimer mon bien
            </Link>
            <Link href="/pro/rejoindre" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,.1)', color: 'white',
              fontWeight: 600, fontSize: '.875rem',
              padding: '8px 18px', borderRadius: '10px',
              textDecoration: 'none', minHeight: 'auto',
              border: '1px solid rgba(255,255,255,.15)',
            }}>
              🏢 Espace Pro
            </Link>
          </div>
        </div>

        {/* ── Carte (prend tout l'espace restant) ──────────────── */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Suspense>
            <TerrimoMap />
          </Suspense>
        </div>
      </main>
    </>
  );
}
