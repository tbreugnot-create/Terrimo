import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { COMMUNES, COMMUNE_BY_SLUG } from '@/lib/communes';
import DvfStats from '@/components/DvfStats';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const commune = COMMUNE_BY_SLUG[slug];
  if (!commune) return {};

  return {
    title: `Immobilier à ${commune.name} — Prix, transactions DVF | Terrimo`,
    description: `Découvrez le marché immobilier de ${commune.name} : prix au m², transactions DVF, agences locales. ${commune.tagline}`,
  };
}

export async function generateStaticParams() {
  return COMMUNES.map((c) => ({ slug: c.slug }));
}

export default async function QuartierPage({ params }: Props) {
  const { slug } = await params;
  const commune = COMMUNE_BY_SLUG[slug];

  if (!commune) notFound();

  const tierColors: Record<string, { bg: string; text: string }> = {
    premium:  { bg: 'rgba(139,92,246,.15)', text: '#c4b5fd' },
    equilibre: { bg: 'rgba(14,165,233,.15)', text: '#7dd3fc' },
    emergent:  { bg: 'rgba(16,185,129,.15)', text: '#6ee7b7' },
  };
  const tc = tierColors[commune.tier] ?? tierColors.equilibre;

  const similarCommunes = COMMUNES.filter(
    (c) => c.slug !== slug && c.tier === commune.tier
  ).slice(0, 3);

  return (
    <main style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(40px,7vh,72px) 24px clamp(32px,5vh,56px)',
        overflow: 'hidden',
      }}>
        {/* Fond radial */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8125rem', color: 'rgba(255,255,255,.35)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>Carte</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.55)' }}>Communes</span>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.8)' }}>{commune.name}</span>
          </nav>

          {/* Tier badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: tc.bg,
            border: `1px solid ${tc.text}30`,
            borderRadius: 100, padding: '4px 14px',
            fontSize: '.75rem', fontWeight: 700, color: tc.text,
            letterSpacing: '.06em', marginBottom: 16,
          }}>
            {commune.tierEmoji} {commune.tierLabel.toUpperCase()}
          </div>

          <h1 style={{
            fontSize: 'clamp(1.875rem,4.5vw,2.75rem)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.1, letterSpacing: '-.03em',
            marginBottom: 10,
          }}>
            Immobilier à {commune.name}
          </h1>
          <p style={{
            fontSize: 'clamp(.9375rem,2vw,1.125rem)',
            color: 'rgba(255,255,255,.5)', lineHeight: 1.6,
            maxWidth: 600, marginBottom: 0,
          }}>
            {commune.tagline}
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 240px',
          gap: 32,
          alignItems: 'start',
        }}>

          {/* ── Colonne principale ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Description */}
            <div style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16, padding: '24px 26px',
            }}>
              <p style={{
                color: 'rgba(255,255,255,.65)',
                lineHeight: 1.75, fontSize: '.9375rem', margin: 0,
              }}>
                {commune.description}
              </p>
            </div>

            {/* Stats DVF réelles */}
            <div style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              <DvfStats dvfName={commune.dvfName} communeName={commune.name} />
            </div>

            {/* CTA Estimer */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,.2), rgba(79,70,229,.1))',
              border: '1px solid rgba(99,102,241,.3)',
              borderRadius: 18, padding: '28px 30px',
            }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', color: '#a5b4fc', marginBottom: 10 }}>
                ESTIMATION GRATUITE
              </div>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
                Estimer votre bien à {commune.name}
              </h3>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9rem', lineHeight: 1.65, marginBottom: 22 }}>
                Fourchette de prix basée sur les données DVF officielles de {commune.name}. En 2 minutes, gratuitement.
              </p>
              <Link
                href={`/evaluer?commune=${slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '11px 22px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', fontWeight: 700, fontSize: '.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(99,102,241,.35)',
                }}
              >
                Estimer gratuitement →
              </Link>
            </div>

            {/* CTA carte */}
            <div style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 18, padding: '24px 26px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: 6 }}>
                  Explorer {commune.name} sur la carte
                </h3>
                <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.875rem', lineHeight: 1.55, margin: 0 }}>
                  Agences, biens disponibles et transactions récentes.
                </p>
              </div>
              <Link
                href={`/?commune=${slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 12, flexShrink: 0,
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.8)', fontWeight: 600, fontSize: '.875rem',
                  textDecoration: 'none',
                }}
              >
                🗺️ Voir la carte
              </Link>
            </div>

            {/* CTA Pro */}
            <div style={{
              background: 'rgba(255,255,255,.02)',
              border: '1px solid rgba(255,255,255,.05)',
              borderRadius: 18, padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            }}>
              <div>
                <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.4)', margin: 0 }}>
                  Vous êtes professionnel à {commune.name} ?{' '}
                  <Link href="/pro/rejoindre" style={{ color: '#7dd3fc', textDecoration: 'none', fontWeight: 600 }}>
                    Rejoindre Terrimo →
                  </Link>
                </p>
              </div>
            </div>

          </div>

          {/* ── Colonne latérale ───────────────────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Communes similaires */}
            {similarCommunes.length > 0 && (
              <div>
                <p style={{
                  fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.1em',
                  color: 'rgba(255,255,255,.3)', textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                  Communes similaires
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {similarCommunes.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/quartier/${c.slug}`}
                      style={{
                        display: 'block',
                        padding: '12px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,.03)',
                        border: '1px solid rgba(255,255,255,.06)',
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.125rem' }}>{c.tierEmoji}</span>
                        <div>
                          <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'rgba(255,255,255,.85)', margin: 0 }}>
                            {c.name}
                          </p>
                          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', margin: '2px 0 0', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const }}>
                            {c.tagline}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Toutes les communes */}
            <div>
              <p style={{
                fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.1em',
                color: 'rgba(255,255,255,.3)', textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Toutes les communes
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {COMMUNES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/quartier/${c.slug}`}
                    style={{
                      display: 'block',
                      padding: '8px 12px', borderRadius: 10,
                      fontSize: '.875rem', textDecoration: 'none',
                      fontWeight: c.slug === slug ? 700 : 400,
                      color: c.slug === slug ? 'white' : 'rgba(255,255,255,.45)',
                      background: c.slug === slug ? 'rgba(99,102,241,.2)' : 'transparent',
                    }}
                  >
                    {c.tierEmoji} {c.name}
                  </Link>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </section>

    </main>
  );
}
