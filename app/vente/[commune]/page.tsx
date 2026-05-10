import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { COMMUNES } from '@/lib/communes';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const fmtM2 = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €/m²';

// ─── Données par commune ──────────────────────────────────────────────────────
async function fetchBiensVente(communeSlug: string) {
  try {
    const rows = await sql`
      SELECT
        b.id, b.type_bien, b.titre, b.prix, b.surface, b.pieces, b.commune,
        b.is_featured, b.created_at,
        b.photos,
        a.name AS acteur_name, a.slug AS acteur_slug, a.type AS acteur_type
      FROM biens b
      LEFT JOIN acteurs a ON a.id = b.acteur_id AND a.is_active = true
      WHERE b.is_active = true
        AND b.type_annonce = 'vente'
        AND lower(replace(replace(replace(b.commune, ' ', '-'), '\'', '-'), 'é', 'e')) LIKE ${communeSlug.replace(/-/g, '%')}
      ORDER BY b.is_featured DESC, b.created_at DESC
      LIMIT 24
    `;
    return rows as Array<{
      id: number; type_bien: string; titre?: string; prix?: number; surface?: number;
      pieces?: number; commune?: string; is_featured: boolean; created_at: string;
      photos: { url: string }[]; acteur_name?: string; acteur_slug?: string; acteur_type?: string;
    }>;
  } catch { return []; }
}

async function fetchDvfStats(communeSlug: string) {
  // Cherche dans la table dvf_stats si elle existe
  try {
    const rows = await sql`
      SELECT
        AVG(prix_m2) AS prix_m2_moyen,
        COUNT(*) AS nb_transactions,
        AVG(CASE WHEN type_local = 'Maison' THEN prix_m2 END) AS prix_m2_maison,
        AVG(CASE WHEN type_local = 'Appartement' THEN prix_m2 END) AS prix_m2_appart
      FROM dvf
      WHERE LOWER(nom_commune) LIKE ${communeSlug.replace(/-/g, '%')}
        AND date_mutation >= NOW() - INTERVAL '2 years'
    `;
    const r = rows[0] as { prix_m2_moyen?: string; nb_transactions?: string; prix_m2_maison?: string; prix_m2_appart?: string };
    return {
      prix_m2_moyen:  r?.prix_m2_moyen  ? Math.round(Number(r.prix_m2_moyen))  : null,
      nb_transactions: r?.nb_transactions ? Number(r.nb_transactions) : 0,
      prix_m2_maison:  r?.prix_m2_maison  ? Math.round(Number(r.prix_m2_maison))  : null,
      prix_m2_appart:  r?.prix_m2_appart  ? Math.round(Number(r.prix_m2_appart))  : null,
    };
  } catch { return null; }
}

// ─── generateStaticParams ─────────────────────────────────────────────────────
export async function generateStaticParams() {
  return COMMUNES.map(c => ({ commune: c.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ commune: string }> }
): Promise<Metadata> {
  const { commune: slug } = await params;
  const commune = COMMUNES.find(c => c.slug === slug);
  if (!commune) return { title: 'Commune introuvable' };

  const title = `Maison et appartement à vendre à ${commune.name} | Terrimo`;
  const description = `Découvrez les biens à vendre à ${commune.name} sur le Bassin d'Arcachon. Prix au m², annonces exclusives, estimation gratuite. ${commune.tagline}`;

  return {
    title,
    description,
    alternates: { canonical: `https://terrimo.homes/vente/${slug}` },
    openGraph: {
      title: `Immobilier à vendre à ${commune.name} — Terrimo`,
      description,
      type: 'website',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
      url: `https://terrimo.homes/vente/${slug}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function VenteCommunePage(
  { params }: { params: Promise<{ commune: string }> }
) {
  const { commune: slug } = await params;
  const commune = COMMUNES.find(c => c.slug === slug);
  if (!commune) notFound();

  const [biens, dvf] = await Promise.all([
    fetchBiensVente(slug),
    fetchDvfStats(slug),
  ]);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `Biens à vendre à ${commune.name}`,
        numberOfItems: biens.length,
        itemListElement: biens.slice(0, 10).map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'RealEstateListing',
            name: b.titre ?? `${b.type_bien} à vendre à ${commune.name}`,
            url: `https://terrimo.homes/bien/${b.id}`,
            ...(b.prix ? { price: b.prix, priceCurrency: 'EUR' } : {}),
            ...(b.surface ? { floorSize: { '@type': 'QuantitativeValue', value: b.surface, unitCode: 'MTK' } } : {}),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://terrimo.homes' },
          { '@type': 'ListItem', position: 2, name: `${commune.name}`, item: `https://terrimo.homes/quartier/${slug}` },
          { '@type': 'ListItem', position: 3, name: 'Vente', item: `https://terrimo.homes/vente/${slug}` },
        ],
      },
    ],
  };

  const TYPES = ['Maison', 'Appartement', 'Villa', 'Terrain'];
  const byType = TYPES.map(t => ({
    type: t,
    count: biens.filter(b => b.type_bien === t).length,
  })).filter(t => t.count > 0);

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
            <Link href={`/location/${slug}`} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Location</Link>
            <Link href={`/quartier/${slug}`} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Le quartier</Link>
            <Link href="/acquereur" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Déposer ma recherche</Link>
          </div>
        </nav>

        {/* Hero */}
        <header style={{ background: '#0a1628', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '40px 24px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>

            {/* Breadcrumb */}
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span>
              <Link href={`/quartier/${slug}`} style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>{commune.name}</Link>
              <span>›</span>
              <span style={{ color: 'rgba(255,255,255,.7)' }}>Vente</span>
            </div>

            <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Immobilier à vendre à {commune.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 16, maxWidth: 640, marginBottom: 20 }}>
              {commune.tagline}
            </p>

            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>
                {biens.length} bien{biens.length > 1 ? 's' : ''} disponible{biens.length > 1 ? 's' : ''}
              </div>
              {dvf?.prix_m2_moyen && (
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                  Prix médian : <strong style={{ color: '#fff' }}>{fmtM2(dvf.prix_m2_moyen)}</strong>
                </div>
              )}
              {dvf?.prix_m2_maison && (
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                  Maisons : <strong style={{ color: '#fff' }}>{fmtM2(dvf.prix_m2_maison)}</strong>
                </div>
              )}
              {dvf?.prix_m2_appart && (
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                  Apparts : <strong style={{ color: '#fff' }}>{fmtM2(dvf.prix_m2_appart)}</strong>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

          {/* Filtres rapides par type */}
          {byType.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: '#64748b', marginRight: 4, lineHeight: '32px' }}>Type :</span>
              {byType.map(t => (
                <span key={t.type} style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd',
                }}>
                  {t.type} ({t.count})
                </span>
              ))}
            </div>
          )}

          {/* Grille biens */}
          {biens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
              <h2 style={{ fontSize: 20, color: '#334155', marginBottom: 8 }}>Aucun bien disponible actuellement</h2>
              <p style={{ marginBottom: 24 }}>Déposez votre recherche pour être alerté dès qu&apos;un bien correspond.</p>
              <Link href="/acquereur" style={{
                display: 'inline-block', padding: '12px 28px',
                background: '#0ea5e9', color: '#fff', textDecoration: 'none',
                borderRadius: 12, fontWeight: 700, fontSize: 15,
              }}>
                Déposer ma recherche →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {biens.map(b => {
                const photo = b.photos?.[0]?.url;
                return (
                  <Link key={b.id} href={`/bien/${b.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <article style={{
                      background: '#fff', borderRadius: 16,
                      border: '1px solid #e2e8f0', overflow: 'hidden',
                      transition: 'box-shadow .2s',
                      boxShadow: b.is_featured ? '0 0 0 2px #0ea5e9' : 'none',
                    }}>
                      {/* Photo */}
                      <div style={{ height: 190, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={b.titre ?? b.type_bien} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏠</div>
                        )}
                        {b.is_featured && (
                          <span style={{
                            position: 'absolute', top: 10, left: 10,
                            background: '#0ea5e9', color: '#fff', fontSize: 11, fontWeight: 700,
                            padding: '3px 8px', borderRadius: 6,
                          }}>
                            ⭐ En vedette
                          </span>
                        )}
                        <span style={{
                          position: 'absolute', top: 10, right: 10,
                          background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 11, fontWeight: 600,
                          padding: '3px 8px', borderRadius: 6,
                        }}>
                          {b.type_bien}
                        </span>
                      </div>

                      {/* Infos */}
                      <div style={{ padding: '16px 18px' }}>
                        {b.prix && (
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                            {fmt(b.prix)}
                          </div>
                        )}
                        <h2 style={{ fontSize: 14, color: '#334155', margin: '0 0 8px', fontWeight: 500, lineHeight: 1.4 }}>
                          {b.titre ?? `${b.type_bien} à vendre`}
                        </h2>
                        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#64748b' }}>
                          {b.surface && <span>📐 {b.surface} m²</span>}
                          {b.pieces && <span>🛏 {b.pieces} pièces</span>}
                          {b.prix && b.surface && (
                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#0369a1' }}>
                              {fmtM2(Math.round(b.prix / b.surface))}
                            </span>
                          )}
                        </div>
                        {b.acteur_name && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
                            {b.acteur_type === 'agence' ? '🏢' : '🔬'} {b.acteur_name}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA acquéreur */}
          <div style={{
            marginTop: 48, background: 'linear-gradient(135deg, #0a1628, #0f2240)',
            border: '1px solid rgba(56,189,248,.2)', borderRadius: 20, padding: '32px 40px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24,
            flexWrap: 'wrap',
          }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Vous cherchez un bien à {commune.name} ?
              </h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, margin: 0 }}>
                Déposez votre mandat de recherche. Les agences locales vous contactent si un bien correspond.
              </p>
            </div>
            <Link href="/acquereur" style={{
              flexShrink: 0, display: 'inline-block', padding: '14px 28px',
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15,
            }}>
              Déposer ma recherche →
            </Link>
          </div>

          {/* Contenu éditorial SEO */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Immobilier à {commune.name} : que faut-il savoir ?
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8, fontSize: 15 }}>
              {commune.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
              <Link href={`/quartier/${slug}`} style={{
                display: 'block', padding: '16px 20px',
                background: '#f0f9ff', border: '1px solid #bae6fd',
                borderRadius: 12, textDecoration: 'none', color: '#0369a1', fontWeight: 600, fontSize: 14,
              }}>
                📊 Prix au m² à {commune.name} →
              </Link>
              <Link href={`/evaluer`} style={{
                display: 'block', padding: '16px 20px',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 12, textDecoration: 'none', color: '#15803d', fontWeight: 600, fontSize: 14,
              }}>
                🏷️ Faire estimer mon bien →
              </Link>
            </div>
          </section>

          {/* Liens vers autres communes */}
          <section style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Autres communes du Bassin
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COMMUNES.filter(c => c.slug !== slug).slice(0, 10).map(c => (
                <Link key={c.slug} href={`/vente/${c.slug}`} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  color: '#475569', textDecoration: 'none',
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
