import { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@/lib/db';

// ─────────────────────────────────────────────────────────────
// SEO
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Prix immobilier Bassin d'Arcachon 2024–2025 — Observatoire Terrimo",
  description: "Prix médians au m², volume de transactions, évolution des marchés immobiliers sur Arcachon, La Teste, Cap Ferret, Andernos. Données DVF officielles actualisées.",
  openGraph: {
    title: "Prix immobilier Bassin d'Arcachon — Observatoire Terrimo",
    description: "Prix médians m² par commune, données DVF officielles 2022–2024.",
    type: 'website',
    locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
  },
  alternates: { canonical: 'https://terrimo.homes/marche' },
};

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CommuneStat {
  commune: string;
  maison_median: number | null;
  appartement_median: number | null;
  maison_nb: number;
  appartement_nb: number;
  total_nb: number;
  annee_max: number;
}

interface AnneeEvol {
  annee: number;
  type_local: string;
  commune: string;
  prix_m2_median: number;
  nb: number;
}

// ─────────────────────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────────────────────
const COMMUNES_ORDER = [
  'Arcachon', 'La Teste-de-Buch', 'Lège-Cap-Ferret', 'Andernos-les-Bains',
  'Gujan-Mestras', 'Le Teich', 'Audenge', 'Biganos', 'Mios', 'Salles',
  'Marcheprime', 'Biscarrosse',
];

async function fetchStats(): Promise<CommuneStat[]> {
  try {
    const rows = await sql`
      SELECT
        commune,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prix_m2)
          FILTER (WHERE type_local = 'Maison' AND prix_m2 > 0)   AS maison_median,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prix_m2)
          FILTER (WHERE type_local = 'Appartement' AND prix_m2 > 0) AS appartement_median,
        COUNT(*) FILTER (WHERE type_local = 'Maison')::int        AS maison_nb,
        COUNT(*) FILTER (WHERE type_local = 'Appartement')::int   AS appartement_nb,
        COUNT(*)::int                                              AS total_nb,
        MAX(annee)                                                 AS annee_max
      FROM dvf_transactions
      WHERE annee >= 2022
        AND commune ILIKE ANY(ARRAY[
          '%arcachon%','%teste%','%ferret%','%andernos%','%gujan%',
          '%teich%','%audenge%','%biganos%','%mios%','%salles%',
          '%marcheprime%','%biscarrosse%'
        ])
        AND prix_m2 BETWEEN 500 AND 30000
      GROUP BY commune
      HAVING COUNT(*) >= 5
      ORDER BY MAX(prix_m2) DESC
    `;
    return rows as CommuneStat[];
  } catch {
    return [];
  }
}

async function fetchEvolution(): Promise<AnneeEvol[]> {
  try {
    const rows = await sql`
      SELECT
        annee,
        type_local,
        commune,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prix_m2)::int AS prix_m2_median,
        COUNT(*)::int AS nb
      FROM dvf_transactions
      WHERE annee BETWEEN 2020 AND 2024
        AND type_local IN ('Maison', 'Appartement')
        AND prix_m2 BETWEEN 500 AND 30000
        AND commune ILIKE ANY(ARRAY['%arcachon%','%teste%','%ferret%','%andernos%','%gujan%'])
      GROUP BY annee, type_local, commune
      HAVING COUNT(*) >= 3
      ORDER BY commune, type_local, annee
    `;
    return rows as AnneeEvol[];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtPrix(n: number | null) {
  if (!n) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €/m²';
}

function getEvol(rows: AnneeEvol[], commune: string, type: string): { pct: number; label: string } | null {
  const filtered = rows.filter(r =>
    r.commune.toLowerCase().includes(commune.toLowerCase().split(' ')[0]) &&
    r.type_local === type
  ).sort((a, b) => a.annee - b.annee);
  if (filtered.length < 2) return null;
  const old = filtered[filtered.length - 2];
  const cur = filtered[filtered.length - 1];
  const pct = Math.round(((cur.prix_m2_median - old.prix_m2_median) / old.prix_m2_median) * 100);
  return { pct, label: `${old.annee}→${cur.annee}` };
}

function EvolBadge({ pct, label }: { pct: number; label: string }) {
  const up = pct > 0;
  return (
    <span style={{
      fontSize: '.75rem', fontWeight: 700,
      color: up ? '#15803d' : '#dc2626',
      background: up ? '#dcfce7' : '#fee2e2',
      padding: '2px 7px', borderRadius: '20px',
      display: 'inline-flex', alignItems: 'center', gap: '2px',
    }}>
      {up ? '↑' : '↓'}{Math.abs(pct)}% <span style={{ fontWeight: 400, opacity: .7 }}>{label}</span>
    </span>
  );
}

function PrixBar({ value, max, color }: { value: number | null; max: number; color: string }) {
  if (!value) return <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', width: '100%' }} />;
  const w = Math.round((value / max) * 100);
  return (
    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: '4px', transition: 'width .3s' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default async function MarchePage() {
  const [stats, evols] = await Promise.all([fetchStats(), fetchEvolution()]);

  // Tri selon ordre souhaité
  const sorted = [...stats].sort((a, b) => {
    const ia = COMMUNES_ORDER.findIndex(c => a.commune.toLowerCase().includes(c.toLowerCase().split('-')[0]));
    const ib = COMMUNES_ORDER.findIndex(c => b.commune.toLowerCase().includes(c.toLowerCase().split('-')[0]));
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const allMaison    = stats.map(s => s.maison_median).filter((v): v is number => !!v);
  const allAppart    = stats.map(s => s.appartement_median).filter((v): v is number => !!v);
  const maxMaison    = allMaison.length ? Math.max(...allMaison) : 10000;
  const maxAppart    = allAppart.length ? Math.max(...allAppart) : 10000;

  const totalTransactions = stats.reduce((s, r) => s + r.total_nb, 0);
  const medianMaisonAll   = allMaison.length
    ? Math.round(allMaison.reduce((a, b) => a + b, 0) / allMaison.length)
    : null;
  const medianAppartAll   = allAppart.length
    ? Math.round(allAppart.reduce((a, b) => a + b, 0) / allAppart.length)
    : null;

  const lastYear = stats[0]?.annee_max ?? 2024;

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: "Prix immobilier Bassin d'Arcachon — Observatoire Terrimo",
    description: "Données DVF officielles : prix médians au m² par commune, évolution des marchés, volume de transactions.",
    url: 'https://terrimo.homes/marche',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
        { '@type': 'ListItem', position: 2, name: "Observatoire du marché", item: 'https://terrimo.homes/marche' },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* ── Hero ───────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
          padding: '64px 20px 56px',
          borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.45)', marginBottom: '24px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span>
              <span>Observatoire</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}>
              Prix de l&apos;immobilier<br />
              <span style={{ color: '#38bdf8' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.125rem', margin: '0 0 40px', maxWidth: '560px', lineHeight: 1.6 }}>
              Données DVF officielles (Demandes de Valeurs Foncières) — {lastYear}.
              Prix médians au m², volume de transactions, évolution annuelle.
            </p>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              {[
                { icon: '🏡', label: 'Prix médian maison', value: fmtPrix(medianMaisonAll) },
                { icon: '🏢', label: 'Prix médian appartement', value: fmtPrix(medianAppartAll) },
                { icon: '📊', label: 'Transactions analysées', value: totalTransactions.toLocaleString('fr-FR') },
                { icon: '🗺️', label: 'Communes couvertes', value: sorted.length.toString() },
              ].map(k => (
                <div key={k.label} style={{
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: '16px', padding: '18px',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{k.icon}</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white' }}>{k.value}</div>
                  <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.5)', marginTop: '3px' }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tableau par commune ─────────────────────── */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Prix par commune
            </h2>
            <p style={{ fontSize: '.8125rem', color: '#94a3b8', margin: 0 }}>
              Source : Demandes de Valeurs Foncières (DVF) — données {lastYear}
            </p>
          </div>

          {sorted.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Données DVF en cours de chargement…</p>
              <p style={{ color: '#cbd5e1', fontSize: '.875rem', marginTop: '8px' }}>
                La base DVF est alimentée progressivement — revenez dans quelques jours.
              </p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1fr',
                gap: '12px',
                padding: '14px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '.8rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '.05em',
              }}>
                <div>COMMUNE</div>
                <div>🏡 MAISON</div>
                <div>🏢 APPARTEMENT</div>
              </div>

              {sorted.map((row, i) => {
                const evolM = getEvol(evols, row.commune, 'Maison');
                const evolA = getEvol(evols, row.commune, 'Appartement');
                return (
                  <div
                    key={row.commune}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1fr 1fr',
                      gap: '12px',
                      padding: '16px 24px',
                      borderBottom: i < sorted.length - 1 ? '1px solid #f1f5f9' : 'none',
                      alignItems: 'center',
                    }}
                  >
                    {/* Commune */}
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem' }}>
                        {row.commune}
                      </div>
                      <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {row.total_nb} transaction{row.total_nb > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Maison */}
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '.9375rem', marginBottom: '5px' }}>
                        {fmtPrix(row.maison_median)}
                      </div>
                      <PrixBar value={row.maison_median} max={maxMaison} color="#6366f1" />
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>{row.maison_nb} ventes</span>
                        {evolM && <EvolBadge pct={evolM.pct} label={evolM.label} />}
                      </div>
                    </div>

                    {/* Appartement */}
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '.9375rem', marginBottom: '5px' }}>
                        {fmtPrix(row.appartement_median)}
                      </div>
                      <PrixBar value={row.appartement_median} max={maxAppart} color="#38bdf8" />
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>{row.appartement_nb} ventes</span>
                        {evolA && <EvolBadge pct={evolA.pct} label={evolA.label} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Note méthodologique ─── */}
          <div style={{
            marginTop: '24px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '20px',
          }}>
            <h3 style={{ fontSize: '.875rem', fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>
              📋 Méthodologie
            </h3>
            <p style={{ fontSize: '.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Les données proviennent des <strong>Demandes de Valeurs Foncières (DVF)</strong>, publiées par la DGFiP et
              disponibles sur data.gouv.fr. Sont incluses les ventes de maisons et appartements à usage résidentiel.
              Les prix au m² sont calculés sur la surface réelle bâtie. La médiane est utilisée (pas la moyenne) pour
              limiter l&apos;impact des biens atypiques. Seules les communes du Bassin d&apos;Arcachon ayant au moins 5 transactions
              sur la période sont affichées.
            </p>
          </div>

          {/* ── CTA Estimation ─── */}
          <div style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, #0a1626, #0f2040)',
            borderRadius: '20px', padding: '32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: '16px',
          }}>
            <div style={{ fontSize: '2rem' }}>🏡</div>
            <h3 style={{ fontWeight: 800, color: 'white', fontSize: '1.25rem', margin: 0 }}>
              Estimez votre bien avec les données DVF
            </h3>
            <p style={{ color: 'rgba(255,255,255,.6)', margin: 0, maxWidth: '440px', fontSize: '.9375rem', lineHeight: 1.6 }}>
              Notre algorithme croise les transactions DVF similaires à votre bien pour vous donner
              une estimation précise, fondée sur les prix réels du marché.
            </p>
            <Link href="/evaluer" style={{
              background: '#38bdf8', color: '#0a1626',
              fontWeight: 800, fontSize: '1rem', padding: '14px 32px',
              borderRadius: '14px', textDecoration: 'none', display: 'inline-block',
            }}>
              Estimer mon bien →
            </Link>
          </div>

          {/* ── CTA Agences ─── */}
          <div style={{
            marginTop: '20px',
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '20px', padding: '28px',
            display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 6px', fontSize: '1.0625rem' }}>
                Vous êtes professionnel de l&apos;immobilier ?
              </h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '.9rem', lineHeight: 1.5 }}>
                Accédez aux données DVF détaillées par type de bien, publiez vos annonces et recevez
                les profils acquéreurs de votre commune.
              </p>
            </div>
            <Link href="/pro/rejoindre" style={{
              background: '#6366f1', color: 'white',
              fontWeight: 700, padding: '12px 24px', borderRadius: '12px',
              textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '.9375rem',
              flexShrink: 0,
            }}>
              Rejoindre Terrimo Pro →
            </Link>
          </div>

          {/* ── Liens communes ─── */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Explorer les annonces par commune
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { label: 'Arcachon', slug: 'arcachon' },
                { label: 'La Teste-de-Buch', slug: 'la-teste-de-buch' },
                { label: 'Lège-Cap-Ferret', slug: 'lege-cap-ferret' },
                { label: 'Andernos', slug: 'andernos-les-bains' },
                { label: 'Gujan-Mestras', slug: 'gujan-mestras' },
                { label: 'Le Teich', slug: 'le-teich' },
              ].map(c => (
                <Link key={c.slug} href={`/vente/${c.slug}`} style={{
                  background: '#f1f5f9', color: '#475569',
                  padding: '6px 14px', borderRadius: '20px', fontSize: '.875rem',
                  textDecoration: 'none', fontWeight: 500,
                  border: '1px solid #e2e8f0',
                }}>
                  Ventes {c.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
