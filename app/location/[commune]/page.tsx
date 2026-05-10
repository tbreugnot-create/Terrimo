import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { COMMUNES } from '@/lib/communes';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

async function fetchBiensLocation(communeSlug: string) {
  try {
    const rows = await sql`
      SELECT
        b.id, b.type_bien, b.type_annonce, b.titre, b.prix, b.surface, b.pieces,
        b.commune, b.is_featured, b.created_at, b.photos,
        a.name AS acteur_name, a.slug AS acteur_slug, a.type AS acteur_type
      FROM biens b
      LEFT JOIN acteurs a ON a.id = b.acteur_id AND a.is_active = true
      WHERE b.is_active = true
        AND b.type_annonce IN ('location', 'location_saisonniere')
        AND lower(replace(replace(replace(b.commune, ' ', '-'), '\'', '-'), 'é', 'e')) LIKE ${communeSlug.replace(/-/g, '%')}
      ORDER BY b.is_featured DESC, b.type_annonce ASC, b.created_at DESC
      LIMIT 24
    `;
    return rows as Array<{
      id: number; type_bien: string; type_annonce: string; titre?: string;
      prix?: number; surface?: number; pieces?: number; commune?: string;
      is_featured: boolean; created_at: string;
      photos: { url: string }[];
      acteur_name?: string; acteur_slug?: string; acteur_type?: string;
    }>;
  } catch { return []; }
}

export async function generateStaticParams() {
  return COMMUNES.map(c => ({ commune: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ commune: string }> }
): Promise<Metadata> {
  const { commune: slug } = await params;
  const commune = COMMUNES.find(c => c.slug === slug);
  if (!commune) return { title: 'Commune introuvable' };

  const title = `Location immobilière à ${commune.name} — Bassin d'Arcachon | Terrimo`;
  const description = `Location annuelle et saisonnière à ${commune.name}. Appartements, maisons, villas sur le Bassin d'Arcachon. Annonces directes d'agences locales vérifiées.`;

  return {
    title,
    description,
    alternates: { canonical: `https://terrimo.homes/location/${slug}` },
    openGraph: {
      title: `Location à ${commune.name} — Terrimo`,
      description,
      type: 'website',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
      url: `https://terrimo.homes/location/${slug}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function LocationCommunePage(
  { params }: { params: Promise<{ commune: string }> }
) {
  const { commune: slug } = await params;
  const commune = COMMUNES.find(c => c.slug === slug);
  if (!commune) notFound();

  const biens = await fetchBiensLocation(slug);

  const annuels     = biens.filter(b => b.type_annonce === 'location');
  const saisonniers = biens.filter(b => b.type_annonce === 'location_saisonniere');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `Locations à ${commune.name}`,
        numberOfItems: biens.length,
        itemListElement: biens.slice(0, 10).map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'RealEstateListing',
            name: b.titre ?? `${b.type_bien} à louer à ${commune.name}`,
            url: `https://terrimo.homes/bien/${b.id}`,
            ...(b.prix ? { price: b.prix, priceCurrency: 'EUR' } : {}),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://terrimo.homes' },
          { '@type': 'ListItem', position: 2, name: commune.name, item: `https://terrimo.homes/quartier/${slug}` },
          { '@type': 'ListItem', position: 3, name: 'Location', item: `https://terrimo.homes/location/${slug}` },
        ],
      },
    ],
  };

  const labelType = (type: string) =>
    type === 'location_saisonniere' ? '☀️ Saisonnier' : '📅 Annuel';

  const labelPrix = (b: typeof biens[0]) => {
    if (!b.prix) return null;
    if (b.type_annonce === 'location_saisonniere') return `${fmt(b.prix)}/sem.`;
    return `${fmt(b.prix)}/mois`;
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

        {/* Nav */}
        <nav style={{ background: '#0a1628', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Carte</Link>
            <Link href={`/vente/${slug}`} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Vente</Link>
            <Link href={`/quartier/${slug}`} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Le quartier</Link>
            <Link href="/acquereur" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Déposer ma recherche</Link>
          </div>
        </nav>

        {/* Hero */}
        <header style={{ background: '#0a1628', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '40px 24px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 16, display: 'flex', gap: 6 }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span>
              <Link href={`/quartier/${slug}`} style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>{commune.name}</Link>
              <span>›</span>
              <span style={{ color: 'rgba(255,255,255,.7)' }}>Location</span>
            </div>

            <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Location à {commune.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 16, maxWidth: 640, marginBottom: 20 }}>
              Location annuelle et saisonnière — {commune.tagline}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>
                {biens.length} bien{biens.length > 1 ? 's' : ''} disponible{biens.length > 1 ? 's' : ''}
              </div>
              {annuels.length > 0 && (
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                  📅 {annuels.length} location{annuels.length > 1 ? 's' : ''} annuelle{annuels.length > 1 ? 's' : ''}
                </div>
              )}
              {saisonniers.length > 0 && (
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                  ☀️ {saisonniers.length} location{saisonniers.length > 1 ? 's' : ''} saisonnière{saisonniers.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

          {/* Tabs annuel / saisonnier */}
          {annuels.length > 0 && saisonniers.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }}>
                📅 Annuel ({annuels.length})
              </span>
              <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                ☀️ Saisonnier ({saisonniers.length})
              </span>
            </div>
          )}

          {/* Grille biens */}
          {biens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏖️</div>
              <h2 style={{ fontSize: 20, color: '#334155', marginBottom: 8 }}>Aucune location disponible actuellement</h2>
              <p style={{ marginBottom: 24 }}>Consultez les biens à vendre ou déposez votre recherche.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={`/vente/${slug}`} style={{ display: 'inline-block', padding: '12px 24px', background: '#0ea5e9', color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 700 }}>
                  Voir les biens à vendre →
                </Link>
                <Link href="/acquereur" style={{ display: 'inline-block', padding: '12px 24px', background: '#f1f5f9', color: '#334155', textDecoration: 'none', borderRadius: 12, fontWeight: 700, border: '1px solid #e2e8f0' }}>
                  Déposer ma recherche
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {biens.map(b => {
                const photo = b.photos?.[0]?.url;
                const prixLabel = labelPrix(b);
                return (
                  <Link key={b.id} href={`/bien/${b.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <article style={{
                      background: '#fff', borderRadius: 16,
                      border: b.is_featured ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                      overflow: 'hidden',
                    }}>
                      <div style={{ height: 190, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={b.titre ?? b.type_bien} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏡</div>
                        )}
                        <span style={{
                          position: 'absolute', top: 10, right: 10,
                          background: b.type_annonce === 'location_saisonniere' ? '#f59e0b' : '#3b82f6',
                          color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        }}>
                          {labelType(b.type_annonce)}
                        </span>
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        {prixLabel && (
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                            {prixLabel}
                          </div>
                        )}
                        <h2 style={{ fontSize: 14, color: '#334155', margin: '0 0 8px', fontWeight: 500, lineHeight: 1.4 }}>
                          {b.titre ?? `${b.type_bien} à louer`}
                        </h2>
                        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#64748b' }}>
                          {b.surface && <span>📐 {b.surface} m²</span>}
                          {b.pieces && <span>🛏 {b.pieces} pièces</span>}
                        </div>
                        {b.acteur_name && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
                            {b.acteur_type === 'agence' ? '🏢' : '🔑'} {b.acteur_name}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA conciergerie */}
          <div style={{
            marginTop: 48, background: 'linear-gradient(135deg, #0a1628, #0f2240)',
            border: '1px solid rgba(56,189,248,.2)', borderRadius: 20,
            padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Vous avez un bien à louer à {commune.name} ?
              </h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, margin: 0 }}>
                Rejoignez les acteurs pro de Terrimo et publiez vos annonces de location.
              </p>
            </div>
            <Link href="/pro/rejoindre" style={{
              flexShrink: 0, display: 'inline-block', padding: '14px 28px',
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15,
            }}>
              Publier mes locations →
            </Link>
          </div>

          {/* SEO texte */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Louer à {commune.name} : tout ce qu&apos;il faut savoir
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8, fontSize: 15 }}>
              {commune.description}
            </p>
          </section>

          {/* Liens autres communes */}
          <section style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Autres communes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COMMUNES.filter(c => c.slug !== slug).slice(0, 10).map(c => (
                <Link key={c.slug} href={`/location/${c.slug}`} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none',
                }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
