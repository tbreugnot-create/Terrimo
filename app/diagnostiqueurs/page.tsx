import { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@/lib/db';

export const metadata: Metadata = {
  title: "Diagnostiqueurs immobiliers Bassin d'Arcachon — Annuaire | Terrimo",
  description: "Trouvez un diagnostiqueur immobilier certifié sur le Bassin d'Arcachon. DPE, amiante, plomb, électricité, gaz. Arcachon, Cap Ferret, La Teste, Andernos.",
  alternates: { canonical: 'https://terrimo.homes/diagnostiqueurs' },
  openGraph: {
    title: "Diagnostiqueurs immobiliers Bassin d'Arcachon | Terrimo",
    description: "Annuaire des diagnostiqueurs certifiés pour la vente et la location sur le Bassin.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/diagnostiqueurs',
  },
};

interface Diagnostiqueur {
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

async function fetchDiagnostiqueurs(): Promise<Diagnostiqueur[]> {
  try {
    const rows = await sql`
      SELECT id, name, slug, commune, phone, email,
             google_rating, google_reviews, is_verified, plan
      FROM acteurs
      WHERE type = 'diagnostiqueur' AND is_active = true
      ORDER BY plan DESC, google_rating DESC NULLS LAST, name ASC
    `;
    return rows as Diagnostiqueur[];
  } catch {
    return [];
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Diagnostiqueurs immobiliers Bassin d'Arcachon",
  url: 'https://terrimo.homes/diagnostiqueurs',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Diagnostiqueurs', item: 'https://terrimo.homes/diagnostiqueurs' },
    ],
  },
};

const DIAGNOSTICS = [
  { icon: '🌡️', label: 'DPE' },
  { icon: '🔬', label: 'Amiante' },
  { icon: '⚗️', label: 'Plomb' },
  { icon: '⚡', label: 'Électricité' },
  { icon: '🔥', label: 'Gaz' },
  { icon: '🐛', label: 'Termites' },
];

export default async function DiagnostiqueurListPage() {
  const diagnostiqueurs = await fetchDiagnostiqueurs();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1a10 0%, #0c2a18 60%, #0a1f12 100%)',
          padding: '56px 20px 48px', borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span><span>Diagnostiqueurs</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 14px' }}>
              Diagnostiqueurs<br />
              <span style={{ color: '#34d399' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem', margin: '0 0 28px', maxWidth: 520, lineHeight: 1.6 }}>
              {diagnostiqueurs.length > 0 ? `${diagnostiqueurs.length} diagnostiqueurs référencés` : 'Diagnostiqueurs référencés'} sur le Bassin — DPE, amiante, plomb, électricité, gaz. Obligatoire avant vente ou location.
            </p>
            <Link href="/evaluer?intention=diagnostiquer" style={{ padding: '10px 20px', borderRadius: 12, background: '#34d399', color: '#0a1f12', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Trouver un diagnostiqueur →
            </Link>
          </div>
        </div>

        {/* Diagnostics types */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 36 }}>
            {DIAGNOSTICS.map(d => (
              <div key={d.label} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '14px', textAlign: 'center',
                fontSize: '.8rem', color: '#374151', fontWeight: 500,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{d.icon}</div>
                {d.label}
              </div>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 60px' }}>
          {diagnostiqueurs.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 8 }}>Les diagnostiqueurs arrivent bientôt…</p>
              <p style={{ color: '#cbd5e1', fontSize: '.875rem' }}>
                En attendant, <Link href="/evaluer?intention=diagnostiquer" style={{ color: '#10b981' }}>déposez votre besoin</Link> et nous vous mettons en relation.
              </p>
            </div>
          ) : (
            <>
              <style>{`.diag-card:hover { border-color: #34d399 !important; box-shadow: 0 4px 20px rgba(52,211,153,.12); }`}</style>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {diagnostiqueurs.map(d => (
                  <Link key={d.id} href={`/diagnostiqueur/${d.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="diag-card" style={{
                      background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                      padding: '20px', cursor: 'pointer', transition: 'all .15s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: 18, color: 'white',
                        }}>
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.name}
                          </div>
                          <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>📍 {d.commune ?? "Bassin d'Arcachon"}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {d.is_verified && <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '2px 7px', borderRadius: 10, border: '1px solid #d1fae5' }}>✓ Certifié</span>}
                        {d.plan === 'pro' && <span style={{ fontSize: '.7rem', fontWeight: 600, background: '#fffbeb', color: '#d97706', padding: '2px 7px', borderRadius: 10, border: '1px solid #fef3c7' }}>★ Pro</span>}
                      </div>
                      {d.google_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.8125rem', color: '#64748b' }}>
                          <span style={{ color: '#fbbf24' }}>★</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{Number(d.google_rating).toFixed(1)}</span>
                          {d.google_reviews && <span>({d.google_reviews} avis)</span>}
                        </div>
                      )}
                      <div style={{ marginTop: 14, fontSize: '.8125rem', fontWeight: 600, color: '#059669' }}>
                        Voir la fiche →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <div style={{
            marginTop: 48, background: 'linear-gradient(135deg, rgba(16,185,129,.08), rgba(16,185,129,.03))',
            border: '1px solid rgba(16,185,129,.2)', borderRadius: 20, padding: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Vous êtes diagnostiqueur ?</p>
              <p style={{ fontSize: '.875rem', color: '#64748b' }}>Référencez-vous gratuitement et recevez des demandes qualifiées de propriétaires du Bassin.</p>
            </div>
            <Link href="/pro/rejoindre?type=diagnostiqueur" style={{
              flexShrink: 0, padding: '11px 22px', borderRadius: 12,
              background: '#059669', color: 'white', fontWeight: 700, fontSize: '.9rem',
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
