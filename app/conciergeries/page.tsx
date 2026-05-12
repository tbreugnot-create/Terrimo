import { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@/lib/db';

export const metadata: Metadata = {
  title: "Conciergeries location saisonnière Bassin d'Arcachon — Annuaire | Terrimo",
  description: "Trouvez la meilleure conciergerie pour votre bien sur le Bassin d'Arcachon. Gestion Airbnb, ménage, accueil voyageurs, linge. Arcachon, Cap Ferret, La Teste, Andernos.",
  alternates: { canonical: 'https://terrimo.homes/conciergeries' },
  openGraph: {
    title: "Conciergeries location saisonnière Bassin d'Arcachon | Terrimo",
    description: "Annuaire des conciergeries vérifiées pour la location saisonnière sur le Bassin.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/conciergeries',
  },
};

interface Conciergerie {
  id: number;
  name: string;
  slug: string;
  commune: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  google_rating: number | null;
  google_reviews: number | null;
  is_verified: boolean;
  plan: string;
  meta: { services?: string[]; zones_couvertes?: string[]; tarif_gestion?: string; description?: string } | null;
}

async function fetchConciergeries(): Promise<Conciergerie[]> {
  try {
    const rows = await sql`
      SELECT id, name, slug, commune, phone, email, website,
             google_rating, google_reviews, is_verified, plan, meta
      FROM acteurs
      WHERE type = 'conciergerie' AND is_active = true
      ORDER BY plan DESC, google_rating DESC NULLS LAST, name ASC
    `;
    return rows.map(r => ({
      ...r,
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : (r.meta ?? null),
    })) as Conciergerie[];
  } catch {
    return [];
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Conciergeries location saisonnière Bassin d'Arcachon",
  url: 'https://terrimo.homes/conciergeries',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Conciergeries', item: 'https://terrimo.homes/conciergeries' },
    ],
  },
};

export default async function ConciergeriePage() {
  const conciergeries = await fetchConciergeries();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
          padding: '56px 20px 48px', borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span>
              <Link href="/louer" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Mettre en location</Link>
              <span>›</span><span>Conciergeries</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 14px' }}>
              Conciergeries<br />
              <span style={{ color: '#38bdf8' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem', margin: '0 0 28px', maxWidth: 520, lineHeight: 1.6 }}>
              {conciergeries.length > 0 ? `${conciergeries.length} conciergeries référencées` : 'Conciergeries référencées'} pour la location saisonnière sur le Bassin — gestion Airbnb, ménage, accueil, linge. Service clés en main.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/louer" style={{ padding: '10px 20px', borderRadius: 12, background: '#38bdf8', color: '#0a1626', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Trouver ma conciergerie →
              </Link>
              <Link href="/evaluer" style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Estimer mes revenus locatifs
              </Link>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px 60px' }}>

          {/* Explication services */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 36 }}>
            {[
              { icon: '🧹', label: 'Ménage & entretien' },
              { icon: '🛏️', label: 'Gestion du linge' },
              { icon: '🔑', label: 'Accueil voyageurs' },
              { icon: '📱', label: 'Gestion Airbnb / Booking' },
              { icon: '🔧', label: 'Petites réparations' },
              { icon: '📊', label: 'Reporting propriétaire' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
                fontSize: '.875rem', color: '#374151',
              }}>
                <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                <span style={{ fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {conciergeries.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏡</div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 8 }}>Les conciergeries arrivent bientôt…</p>
              <p style={{ color: '#cbd5e1', fontSize: '.875rem' }}>
                En attendant, <Link href="/louer" style={{ color: '#6366f1' }}>déposez votre projet</Link> et nous vous mettons en relation sous 24h.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {conciergeries.map(c => {
                const zones = (c.meta?.zones_couvertes ?? []).slice(0, 3);
                const tarif = c.meta?.tarif_gestion;
                return (
                  <Link key={c.id} href={`/conciergerie/${c.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                      padding: '20px', cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#38bdf8'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(56,189,248,.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: 18, color: 'white',
                        }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>📍 {c.commune ?? 'Bassin d\'Arcachon'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {c.is_verified && <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '2px 7px', borderRadius: 10, border: '1px solid #d1fae5' }}>✓ Vérifié</span>}
                        {tarif && <span style={{ fontSize: '.7rem', fontWeight: 500, background: '#f0fdf4', color: '#16a34a', padding: '2px 7px', borderRadius: 10, border: '1px solid #dcfce7' }}>{tarif}</span>}
                      </div>

                      {zones.length > 0 && (
                        <div style={{ fontSize: '.75rem', color: '#64748b', marginBottom: 10 }}>
                          📍 {zones.join(' · ')}
                        </div>
                      )}

                      {c.google_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.8125rem', color: '#64748b' }}>
                          <span style={{ color: '#fbbf24' }}>★</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.google_rating.toFixed(1)}</span>
                          {c.google_reviews && <span>({c.google_reviews} avis)</span>}
                        </div>
                      )}

                      <div style={{ marginTop: 14, fontSize: '.8125rem', fontWeight: 600, color: '#0891b2' }}>
                        Voir la fiche →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div style={{
            marginTop: 48, background: 'linear-gradient(135deg, rgba(56,189,248,.08), rgba(56,189,248,.03))',
            border: '1px solid rgba(56,189,248,.2)', borderRadius: 20, padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Vous êtes conciergerie ?</p>
              <p style={{ fontSize: '.875rem', color: '#64748b' }}>Référencez-vous gratuitement et recevez des demandes qualifiées de propriétaires du Bassin.</p>
            </div>
            <Link href="/pro/rejoindre?type=conciergerie" style={{
              flexShrink: 0, padding: '11px 22px', borderRadius: 12,
              background: '#0891b2', color: 'white', fontWeight: 700, fontSize: '.9rem',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Rejoindre Terrimo Pro →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
