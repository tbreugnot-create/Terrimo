import { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@/lib/db';

export const metadata: Metadata = {
  title: "Agences immobilières Bassin d'Arcachon — Annuaire | Terrimo",
  description: "Trouvez les meilleures agences immobilières sur le Bassin d'Arcachon. Arcachon, Cap Ferret, La Teste, Andernos, Gujan-Mestras. Avis clients, coordonnées, biens en vente.",
  alternates: { canonical: 'https://terrimo.homes/agences' },
  openGraph: {
    title: "Agences immobilières Bassin d'Arcachon | Terrimo",
    description: "Annuaire des agences immobilières vérifiées sur le Bassin d'Arcachon.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/agences',
  },
};

interface Agence {
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
  biens_count: number;
}

async function fetchAgences(): Promise<Agence[]> {
  try {
    const rows = await sql`
      SELECT a.id, a.name, a.slug, a.commune, a.phone, a.email, a.website,
             a.google_rating, a.google_reviews, a.is_verified, a.plan,
             COUNT(b.id)::int AS biens_count
      FROM acteurs a
      LEFT JOIN biens b ON b.acteur_id = a.id AND b.is_active = true
      WHERE a.type = 'agence' AND a.is_active = true
      GROUP BY a.id
      ORDER BY a.plan DESC, a.google_rating DESC NULLS LAST, a.name ASC
    `;
    return rows as Agence[];
  } catch {
    return [];
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Agences immobilières Bassin d'Arcachon",
  url: 'https://terrimo.homes/agences',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Agences immobilières', item: 'https://terrimo.homes/agences' },
    ],
  },
};

export default async function AgencesPage() {
  const agences = await fetchAgences();

  const communes = [...new Set(agences.map(a => a.commune).filter(Boolean))].sort() as string[];

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
              <span>›</span><span>Agences immobilières</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 14px' }}>
              Agences immobilières<br />
              <span style={{ color: '#38bdf8' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem', margin: '0 0 28px', maxWidth: 500, lineHeight: 1.6 }}>
              {agences.length > 0 ? `${agences.length} agences référencées` : 'Agences référencées'} sur le Bassin d&apos;Arcachon — vente, location, estimation. Coordonnées et avis clients vérifiés.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/evaluer" style={{ padding: '10px 20px', borderRadius: 12, background: '#38bdf8', color: '#0a1626', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Estimer mon bien →
              </Link>
              <Link href="/vendre" style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Trouver une agence pour vendre
              </Link>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px 60px' }}>

          {agences.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏢</div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 8 }}>Les agences arrivent bientôt…</p>
              <p style={{ color: '#cbd5e1', fontSize: '.875rem' }}>
                En attendant, <Link href="/vendre" style={{ color: '#6366f1' }}>déposez votre projet</Link> et nous vous mettons en relation.
              </p>
            </div>
          ) : (
            <>
              {/* Filtre communes */}
              {communes.length > 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                  {communes.map(c => (
                    <a key={c} href={`#${c.toLowerCase().replace(/\s/g, '-')}`} style={{
                      padding: '5px 14px', borderRadius: 20, background: '#f1f5f9',
                      border: '1px solid #e2e8f0', color: '#475569', fontSize: '.8125rem',
                      textDecoration: 'none', fontWeight: 500,
                    }}>
                      {c}
                    </a>
                  ))}
                </div>
              )}

              {/* Grille agences */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {agences.map(a => (
                  <Link key={a.id} href={`/agence/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                      padding: '20px', transition: 'all .15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(99,102,241,.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: 18, color: 'white', flexShrink: 0,
                        }}>
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {a.name}
                          </div>
                          <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>
                            {a.commune ?? 'Bassin d\'Arcachon'}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {a.is_verified && (
                          <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#eef2ff', color: '#6366f1', padding: '2px 7px', borderRadius: 10, border: '1px solid #e0e7ff' }}>✓ Vérifié</span>
                        )}
                        {a.plan === 'pro' && (
                          <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#fffbeb', color: '#d97706', padding: '2px 7px', borderRadius: 10, border: '1px solid #fef3c7' }}>★ Pro</span>
                        )}
                        {a.plan === 'premium' && (
                          <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#fffbeb', color: '#d97706', padding: '2px 7px', borderRadius: 10, border: '1px solid #fde68a' }}>★★ Premium</span>
                        )}
                        {a.biens_count > 0 && (
                          <span style={{ fontSize: '.7rem', fontWeight: 500, background: '#f8fafc', color: '#64748b', padding: '2px 7px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                            {a.biens_count} bien{a.biens_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {a.google_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.8125rem', color: '#64748b' }}>
                          <span style={{ color: '#fbbf24' }}>★</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{a.google_rating.toFixed(1)}</span>
                          {a.google_reviews && <span>({a.google_reviews} avis)</span>}
                        </div>
                      )}

                      {/* CTA */}
                      <div style={{ marginTop: 14, fontSize: '.8125rem', fontWeight: 600, color: '#6366f1' }}>
                        Voir la fiche →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Liens communes */}
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '.875rem', fontWeight: 700, color: '#64748b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Annonces par commune
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['arcachon','lege-cap-ferret','la-teste-de-buch','andernos-les-bains','gujan-mestras','le-teich'].map(slug => (
                <Link key={slug} href={`/vente/${slug}`} style={{
                  padding: '5px 14px', borderRadius: 20, background: '#f1f5f9',
                  border: '1px solid #e2e8f0', color: '#475569', fontSize: '.8125rem',
                  textDecoration: 'none', fontWeight: 500,
                }}>
                  Ventes {slug.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
