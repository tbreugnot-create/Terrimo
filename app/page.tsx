'use client';

import dynamic from 'next/dynamic';
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
