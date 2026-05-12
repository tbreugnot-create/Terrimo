import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import NotairePageClient from './NotairePageClient';
import type { ActeurDetail } from '@/lib/terrimo-types';

// ─── Fetch ────────────────────────────────────────────────
async function fetchActeur(slug: string): Promise<ActeurDetail | null> {
  try {
    const rows = await sql`
      SELECT id, name, type, slug, phone, email, website, address,
             commune, google_rating, google_reviews, is_verified, plan, meta
      FROM acteurs
      WHERE slug = ${slug} AND type = 'notaire' AND is_active = true
      LIMIT 1
    `;
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      meta: typeof row.meta === 'string' ? JSON.parse(row.meta) : (row.meta ?? {}),
    } as ActeurDetail;
  } catch {
    return null;
  }
}

async function fetchAvisStats(acteurId: number): Promise<{ total: number; moyenne: number } | null> {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS total, ROUND(AVG(note)::numeric, 1) AS moyenne
      FROM avis_acteurs
      WHERE acteur_id = ${acteurId} AND is_approved = true
    `;
    const r = rows[0];
    if (!r || !r.total) return null;
    return { total: r.total as number, moyenne: parseFloat(r.moyenne as string) };
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const acteur = await fetchActeur(slug);
  if (!acteur) return { title: 'Notaire introuvable — Terrimo' };

  const commune = acteur.commune ?? "Bassin d'Arcachon";
  const desc = acteur.meta?.description
    ?? `${acteur.name} — Étude notariale à ${commune}. Vente immobilière, succession, donation, estimation officielle sur le Bassin d'Arcachon.`;

  return {
    title: `${acteur.name} — Notaire à ${commune} | Terrimo`,
    description: desc.slice(0, 160),
    alternates: { canonical: `https://terrimo.homes/notaire/${slug}` },
    openGraph: {
      title: `${acteur.name} — Notaire`,
      description: desc.slice(0, 160),
      type: 'website',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
      url: `https://terrimo.homes/notaire/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${acteur.name} — Notaire | Terrimo`,
      description: desc.slice(0, 160),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────
export default async function NotairePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const acteur = await fetchActeur(slug);
  if (!acteur) notFound();

  const avisStats = await fetchAvisStats(acteur.id);

  const aggregateRating = avisStats
    ? { '@type': 'AggregateRating', ratingValue: avisStats.moyenne, reviewCount: avisStats.total, bestRating: 5 }
    : acteur.google_rating
      ? { '@type': 'AggregateRating', ratingValue: acteur.google_rating, reviewCount: acteur.google_reviews ?? 1, bestRating: 5 }
      : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': `https://terrimo.homes/notaire/${slug}`,
    url: `https://terrimo.homes/notaire/${slug}`,
    name: acteur.name,
    description: acteur.meta?.description ?? `Étude notariale à ${acteur.commune ?? "Bassin d'Arcachon"}`,
    ...(acteur.phone ? { telephone: acteur.phone } : {}),
    ...(acteur.email ? { email: acteur.email } : {}),
    ...(acteur.website ? { sameAs: [acteur.website] } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: acteur.address ?? '',
      addressLocality: acteur.commune ?? "Bassin d'Arcachon",
      addressCountry: 'FR',
    },
    ...(aggregateRating ? { aggregateRating } : {}),
    areaServed: { '@type': 'Place', name: "Bassin d'Arcachon" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NotairePageClient acteur={acteur} />
    </>
  );
}
