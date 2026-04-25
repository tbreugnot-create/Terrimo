'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
import Nav from '@/components/Nav';

const TerrimoMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 100%)',
      minHeight: '70vh',
    }}>
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid rgba(255,255,255,.2)',
        borderTop: '3px solid #38bdf8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
      }} />
      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1rem' }}>
        Chargement de la carte…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          style={{
            background: 'linear-gradient(160deg, #0c1a2e 0%, #0f3460 60%, #1a5276 100%)',
            padding: 'clamp(48px, 8vw, 80px) 24px clamp(40px, 7vw, 72px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Texture subtile vague */}
          <div style={{
            position: 'absolute', inset: 0, opacity: .04,
            backgroundImage: 'radial-gradient(circle at 30% 70%, #38bdf8 0%, transparent 60%), radial-gradient(circle at 80% 20%, #0ea5e9 0%, transparent 50%)',
            pointerEvents: 'none',
          }} aria-hidden="true" />

          <div style={{ position: 'relative', maxWidth: '780px', margin: '0 auto' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(56,189,248,.15)',
              border: '1px solid rgba(56,189,248,.3)',
              borderRadius: '100px',
              padding: '6px 16px',
              marginBottom: '24px',
            }}>
              <span style={{ color: '#38bdf8', fontSize: '.875rem', fontWeight: 600 }}>
                🌊 Bassin d'Arcachon · 10 communes · 135 professionnels
              </span>
            </div>

            {/* Titre principal */}
            <h1 style={{
              color: 'white',
              marginBottom: '20px',
              textShadow: '0 2px 20px rgba(0,0,0,.3)',
            }}>
              L'immobilier du Bassin<br />
              <span style={{ color: '#38bdf8' }}>vu comme jamais</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
              color: 'rgba(255,255,255,.75)',
              maxWidth: '560px',
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}>
              Carte interactive des prix réels, des agences et des données de marché.
              Arcachon, Cap Ferret, Pyla — transparent et gratuit.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <a
                href="#carte"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#38bdf8', color: '#0c1a2e',
                  fontWeight: 800, fontSize: '1.0625rem',
                  padding: '14px 28px', borderRadius: '14px',
                  textDecoration: 'none', minHeight: '52px',
                  boxShadow: '0 4px 20px rgba(56,189,248,.4)',
                  transition: 'all .15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(56,189,248,.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(56,189,248,.4)'; }}
              >
                🗺️ Explorer la carte
              </a>
              <Link
                href="/evaluer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,.12)', color: 'white',
                  fontWeight: 700, fontSize: '1.0625rem',
                  padding: '14px 28px', borderRadius: '14px',
                  textDecoration: 'none', minHeight: '52px',
                  border: '1.5px solid rgba(255,255,255,.2)',
                  transition: 'all .15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'; }}
              >
                🏡 Estimer mon bien
              </Link>
            </div>

            {/* Chiffres clés */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              maxWidth: '520px',
              margin: '40px auto 0',
            }}>
              {[
                { n: '135', l: 'professionnels' },
                { n: '10',  l: 'communes' },
                { n: '100%', l: 'données réelles' },
              ].map(s => (
                <div key={s.n} style={{
                  background: 'rgba(255,255,255,.07)',
                  borderRadius: '12px',
                  padding: '14px 8px',
                  border: '1px solid rgba(255,255,255,.1)',
                }}>
                  <div style={{ color: '#38bdf8', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginTop: '4px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARTE ────────────────────────────────────────── */}
        <section
          id="carte"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100dvh - 68px)',
          }}
        >
          <Suspense>
            <TerrimoMap />
          </Suspense>
        </section>

        {/* ── PITCH PRO ─────────────────────────────────────── */}
        <section style={{
          background: 'white',
          padding: 'clamp(48px, 7vw, 80px) 24px',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '.875rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>
                  Pour les professionnels
                </div>
                <h2 style={{ marginBottom: '16px', color: '#0f172a' }}>
                  Vos prospects vous cherchent ici
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '24px' }}>
                  Agences, notaires, diagnostiqueurs — référencez votre activité sur la carte
                  la plus consultée du Bassin. Recevez les leads en temps réel.
                </p>
                <Link href="/pro/rejoindre" className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
                  Rejoindre Terrimo Pro →
                </Link>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}>
                {[
                  { icon: '🗺️', title: 'Visible sur la carte', desc: 'Votre agence géolocalisée, accessible aux acquéreurs' },
                  { icon: '🔔', title: 'Leads en temps réel', desc: 'Coordonnées des propriétaires qui estiment leur bien' },
                  { icon: '✏️', title: 'Fiche éditable', desc: 'Coordonnées, description, site web à jour' },
                  { icon: '🏠', title: 'Portefeuille biens', desc: 'Vos annonces visibles directement sur la carte' },
                ].map(f => (
                  <div key={f.title} style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    padding: '18px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{f.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '.9375rem', color: '#0f172a', marginBottom: '4px' }}>{f.title}</div>
                    <div style={{ fontSize: '.875rem', color: '#64748b', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer style={{
          background: '#0c1a2e',
          color: 'rgba(255,255,255,.5)',
          padding: '32px 24px',
          textAlign: 'center',
          fontSize: '.875rem',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
              <Link href="/evaluer" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Estimation gratuite</Link>
              <Link href="/pro/rejoindre" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Espace Pro</Link>
              <a href="mailto:pro@terrimo.homes" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Contact</a>
            </div>
            <span>© 2025 Terrimo · Bassin d'Arcachon</span>
          </div>
        </footer>
      </main>
    </>
  );
}
