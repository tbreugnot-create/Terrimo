import { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@/lib/db';

export const metadata: Metadata = {
  title: "Notaires Bassin d'Arcachon — Annuaire | Terrimo",
  description: "Trouvez un notaire sur le Bassin d'Arcachon pour votre vente immobilière, succession, donation ou estimation officielle. Arcachon, Cap Ferret, La Teste, Andernos.",
  alternates: { canonical: 'https://terrimo.homes/notaires' },
  openGraph: {
    title: "Notaires Bassin d'Arcachon | Terrimo",
    description: "Annuaire des notaires du Bassin d'Arcachon. Actes de vente, successions, estimations officielles.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/notaires',
  },
};

interface Notaire {
  id: number;
  name: string;
  slug: string;
  commune: string | null;
  phone: string | null;
  email: string | null;
  google_rating: number | null;
  google_reviews: number | null;
  is_verified: boolean;
  plan: string;
}

async function fetchNotaires(): Promise<Notaire[]> {
  try {
    const rows = await sql`
      SELECT id, name, slug, commune, phone, email,
             google_rating, google_reviews, is_verified, plan
      FROM acteurs
      WHERE type = 'notaire' AND is_active = true
      ORDER BY plan DESC, google_rating DESC NULLS LAST, name ASC
    `;
    return rows as Notaire[];
  } catch {
    return [];
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Notaires Bassin d'Arcachon",
  url: 'https://terrimo.homes/notaires',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Notaires', item: 'https://terrimo.homes/notaires' },
    ],
  },
};

const SERVICES = [
  { icon: '🏠', label: 'Acte de vente' },
  { icon: '⚖️', label: 'Succession' },
  { icon: '🎁', label: 'Donation' },
  { icon: '📊', label: 'Estimation' },
  { icon: '👨‍👩‍👧', label: 'Droit famille' },
  { icon: '📝', label: 'Partage' },
];

export default async function NotaireListPage() {
  const notaires = await fetchNotaires();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0a0e1a 0%, #0e1640 60%, #0c122e 100%)',
          padding: '56px 20px 48px', borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span><span>Notaires</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 14px' }}>
              Notaires<br />
              <span style={{ color: '#818cf8' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem', margin: '0 0 28px', maxWidth: 520, lineHeight: 1.6 }}>
              {notaires.length > 0 ? `${notaires.length} notaires référencés` : 'Notaires référencés'} sur le Bassin — actes de vente, successions, donations, estimations officielles.
            </p>
            <Link href="/evaluer?intention=notaire" style={{ padding: '10px 20px', borderRadius: 12, background: '#818cf8', color: '#0a0e1a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Consulter un notaire →
            </Link>
          </div>
        </div>

        {/* Services */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 36 }}>
            {SERVICES.map(s => (
              <div key={s.label} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '14px', textAlign: 'center',
                fontSize: '.8rem', color: '#374151', fontWeight: 500,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 60px' }}>
          {notaires.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚖️</div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 8 }}>Les notaires arrivent bientôt…</p>
              <p style={{ color: '#cbd5e1', fontSize: '.875rem' }}>
                En attendant, <Link href="/evaluer?intention=notaire" style={{ color: '#6366f1' }}>déposez votre besoin</Link> et nous vous orientons.
              </p>
            </div>
          ) : (
            <>
              <style>{`.notaire-card:hover { border-color: #818cf8 !important; box-shadow: 0 4px 20px rgba(129,140,248,.12); }`}</style>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {notaires.map(n => (
                  <Link key={n.id} href={`/notaire/${n.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="notaire-card" style={{
                      background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                      padding: '20px', cursor: 'pointer', transition: 'all .15s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: 18, color: 'white',
                        }}>
                          {n.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {n.name}
                          </div>
                          <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>📍 {n.commune ?? "Bassin d'Arcachon"}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {n.is_verified && <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#eef2ff', color: '#6366f1', padding: '2px 7px', borderRadius: 10, border: '1px solid #e0e7ff' }}>✓ Vérifié</span>}
                        {n.plan === 'pro' && <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#fffbeb', color: '#d97706', padding: '2px 7px', borderRadius: 10, border: '1px solid #fef3c7' }}>★ Pro</span>}
                      </div>
                      {n.google_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.8125rem', color: '#64748b' }}>
                          <span style={{ color: '#fbbf24' }}>★</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{Number(n.google_rating).toFixed(1)}</span>
                          {n.google_reviews && <span>({n.google_reviews} avis)</span>}
                        </div>
                      )}
                      <div style={{ marginTop: 14, fontSize: '.8125rem', fontWeight: 600, color: '#6366f1' }}>
                        Voir l&apos;étude →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <div style={{
            marginTop: 48, background: 'linear-gradient(135deg, rgba(99,102,241,.08), rgba(99,102,241,.03))',
            border: '1px solid rgba(99,102,241,.2)', borderRadius: 20, padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Vous êtes notaire ?</p>
              <p style={{ fontSize: '.875rem', color: '#64748b' }}>Référencez votre étude gratuitement et recevez des dossiers de vente et succession du Bassin.</p>
            </div>
            <Link href="/pro/rejoindre?type=notaire" style={{
              flexShrink: 0, padding: '11px 22px', borderRadius: 12,
              background: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '.9rem',
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
