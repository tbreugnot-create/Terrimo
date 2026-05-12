import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable — Terrimo',
  description: 'Cette page n\'existe pas. Revenez à la carte immobilière du Bassin d\'Arcachon.',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Icône */}
        <div style={{ fontSize: '5rem', marginBottom: 24, lineHeight: 1 }}>🗺️</div>

        {/* Code */}
        <div style={{
          display: 'inline-block', marginBottom: 20,
          padding: '4px 14px',
          background: 'rgba(56,189,248,.12)', border: '1px solid rgba(56,189,248,.3)',
          borderRadius: 20, fontSize: 13, color: '#7dd3fc',
          letterSpacing: '.05em', fontWeight: 600,
        }}>
          ERREUR 404
        </div>

        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900,
          lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em',
        }}>
          Cette page n&apos;est pas<br />sur la carte
        </h1>

        <p style={{
          color: 'rgba(255,255,255,.5)', fontSize: '1rem',
          lineHeight: 1.7, margin: '0 0 40px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto',
        }}>
          La page que vous cherchez a peut-être été déplacée ou n&apos;existe plus.
          Mais le Bassin d&apos;Arcachon, lui, est toujours là.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 14,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            color: '#0a1626', fontWeight: 800, fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(56,189,248,.3)',
          }}>
            🗺️ Explorer la carte
          </Link>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/evaluer" style={{
              padding: '10px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: '.9rem',
              textDecoration: 'none',
            }}>
              Estimer mon bien
            </Link>
            <Link href="/vente" style={{
              padding: '10px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: '.9rem',
              textDecoration: 'none',
            }}>
              Biens à vendre
            </Link>
            <Link href="/acquereur" style={{
              padding: '10px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: '.9rem',
              textDecoration: 'none',
            }}>
              Déposer ma recherche
            </Link>
          </div>
        </div>

        {/* Liens rapides communes */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Annonces par commune
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {[
              { label: 'Arcachon', slug: 'arcachon' },
              { label: 'Cap Ferret', slug: 'lege-cap-ferret' },
              { label: 'La Teste', slug: 'la-teste-de-buch' },
              { label: 'Andernos', slug: 'andernos-les-bains' },
              { label: 'Gujan', slug: 'gujan-mestras' },
            ].map(c => (
              <Link key={c.slug} href={`/vente/${c.slug}`} style={{
                padding: '5px 12px', borderRadius: 20,
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.5)', fontSize: '.8125rem',
                textDecoration: 'none',
              }}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
