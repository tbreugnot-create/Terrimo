import { Metadata } from 'next';
import Link from 'next/link';
import { COMMUNES } from '@/lib/communes';

export const metadata: Metadata = {
  title: "Biens à vendre Bassin d'Arcachon — Toutes les communes | Terrimo",
  description: "Retrouvez tous les biens immobiliers à vendre sur le Bassin d'Arcachon par commune : Arcachon, Cap Ferret, La Teste-de-Buch, Andernos, Gujan-Mestras et plus.",
  alternates: { canonical: 'https://terrimo.homes/vente' },
  openGraph: {
    title: "Biens à vendre Bassin d'Arcachon | Terrimo",
    description: "Toutes les annonces immobilières de vente sur le Bassin d'Arcachon, commune par commune.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/vente',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Biens à vendre Bassin d'Arcachon",
  url: 'https://terrimo.homes/vente',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Vente', item: 'https://terrimo.homes/vente' },
    ],
  },
};

const TIERS = [
  { key: 'premium', label: 'Marché Premium', emoji: '💎', color: '#6366f1', bg: '#eef2ff', border: '#e0e7ff' },
  { key: 'equilibre', label: 'Marché Équilibré', emoji: '⚖️', color: '#0891b2', bg: '#ecfeff', border: '#cffafe' },
  { key: 'emergent', label: 'Marché Émergent', emoji: '📈', color: '#059669', bg: '#ecfdf5', border: '#d1fae5' },
];

export default function VentePage() {
  const byTier = Object.fromEntries(
    TIERS.map(t => [t.key, COMMUNES.filter(c => c.tier === t.key)])
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
          padding: '56px 20px 48px',
          borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span><span>Biens à vendre</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 14px' }}>
              Biens à vendre<br />
              <span style={{ color: '#38bdf8' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem', margin: '0 0 28px', maxWidth: 520, lineHeight: 1.6 }}>
              Maisons, villas et appartements à vendre sur toutes les communes du Bassin — données DVF + annonces agences en temps réel.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/" style={{ padding: '10px 20px', borderRadius: 12, background: '#38bdf8', color: '#0a1626', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                🗺️ Explorer la carte →
              </Link>
              <Link href="/evaluer" style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Estimer mon bien
              </Link>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 60px' }}>

          {TIERS.map(tier => {
            const communes = byTier[tier.key] ?? [];
            if (!communes.length) return null;
            return (
              <section key={tier.key} style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: '1.375rem' }}>{tier.emoji}</span>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{tier.label}</h2>
                </div>
                <style>{`.vente-card:hover { box-shadow: 0 4px 20px rgba(99,102,241,.1); transform: translateY(-1px); }`}</style>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {communes.map(c => (
                    <Link key={c.slug} href={`/vente/${c.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="vente-card" style={{
                        background: 'white', borderRadius: 16,
                        border: `1px solid ${tier.border}`,
                        padding: '20px',
                        transition: 'all .15s',
                        cursor: 'pointer',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{c.name}</span>
                          <span style={{
                            fontSize: '.7rem', fontWeight: 700,
                            color: tier.color, background: tier.bg,
                            padding: '2px 8px', borderRadius: 10,
                            border: `1px solid ${tier.border}`,
                          }}>
                            {tier.emoji} {c.tierLabel}
                          </span>
                        </div>
                        <p style={{ fontSize: '.8rem', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
                          {c.tagline}
                        </p>
                        <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#6366f1' }}>
                          Voir les biens →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {/* CTA acquéreur */}
          <div style={{
            marginTop: 16, background: 'linear-gradient(135deg, rgba(99,102,241,.08), rgba(99,102,241,.03))',
            border: '1px solid rgba(99,102,241,.2)', borderRadius: 20, padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Vous cherchez un bien précis ?</p>
              <p style={{ fontSize: '.875rem', color: '#64748b' }}>Déposez votre mandat de recherche — les agences du Bassin vous contactent si un bien correspond.</p>
            </div>
            <Link href="/acquereur" style={{
              flexShrink: 0, padding: '11px 22px', borderRadius: 12,
              background: '#6366f1', color: 'white', fontWeight: 700, fontSize: '.9rem',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Déposer ma recherche →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
