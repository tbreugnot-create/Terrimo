import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import AgencePageClient from './AgencePageClient';
import type { ActeurDetail, BienPreview } from '@/lib/terrimo-types';

// Re-export pour les imports locaux existants
export type { ActeurDetail, BienPreview };

// ─── Fetch ────────────────────────────────────────────────
async function fetchActeur(slug: string, types: string[]): Promise<ActeurDetail | null> {
  try {
    const rows = await sql`
      SELECT id, name, type, slug, phone, email, website, address,
             commune, google_rating, google_reviews, is_verified, plan, meta
      FROM acteurs
      WHERE slug = ${slug} AND type = ANY(${types}::text[]) AND is_active = true
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

async function fetchBiens(acteurId: number): Promise<BienPreview[]> {
  try {
    const rows = await sql`
      SELECT id, type_annonce, type_bien, titre, prix, surface, pieces, commune, photos, is_featured
      FROM biens
      WHERE acteur_id = ${acteurId} AND is_active = true
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 12
    `;
    return rows.map((r: Record<string, unknown>) => ({
      ...r,
      photos: typeof r.photos === 'string' ? JSON.parse(r.photos as string) : (r.photos ?? []),
    })) as BienPreview[];
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const acteur = await fetchActeur(slug, ['agence']);
  if (!acteur) return { title: 'Agence introuvable — Terrimo' };

  const desc = acteur.meta?.description
    ?? `${acteur.name} — Agence immobilière à ${acteur.commune ?? 'Bassin d\'Arcachon'}. Mandats de vente, estimation, accompagnement sur le Bassin d\'Arcachon.`;

  const logo = acteur.meta?.logo as string | undefined;

  return {
    title: `${acteur.name} — Agence immobilière | Terrimo`,
    description: desc.slice(0, 160),
    alternates: { canonical: `https://terrimo.homes/agence/${slug}` },
    openGraph: {
      title: `${acteur.name} — Agence immobilière`,
      description: desc.slice(0, 160),
      type: 'website',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
      url: `https://terrimo.homes/agence/${slug}`,
      ...(logo ? { images: [{ url: logo, width: 400, height: 400, alt: acteur.name }] } : {}),
    },
    twitter: {
      card: 'summary',
      title: `${acteur.name} — Agence | Terrimo`,
      description: desc.slice(0, 160),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────
export default async function AgencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const acteur = await fetchActeur(slug, ['agence']);
  if (!acteur) notFound();

  const [biens, avisStats] = await Promise.all([
    fetchBiens(acteur.id),
    fetchAvisStats(acteur.id),
  ]);

  // AggregateRating : on préfère les avis natifs Terrimo si disponibles, sinon Google
  const aggregateRating = avisStats
    ? { '@type': 'AggregateRating', ratingValue: avisStats.moyenne, reviewCount: avisStats.total, bestRating: 5 }
    : acteur.google_rating
      ? { '@type': 'AggregateRating', ratingValue: acteur.google_rating, reviewCount: acteur.google_reviews ?? 1, bestRating: 5 }
      : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `https://terrimo.homes/agence/${slug}`,
    url: `https://terrimo.homes/agence/${slug}`,
    name: acteur.name,
    description: acteur.meta?.description ?? `Agence immobilière à ${acteur.commune ?? 'Bassin d\'Arcachon'}`,
    ...(acteur.phone ? { telephone: acteur.phone } : {}),
    ...(acteur.email ? { email: acteur.email } : {}),
    ...(acteur.website ? { sameAs: [acteur.website] } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: acteur.address ?? '',
      addressLocality: acteur.commune ?? 'Bassin d\'Arcachon',
      addressCountry: 'FR',
    },
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(acteur.meta?.logo ? { logo: acteur.meta.logo } : {}),
    areaServed: { '@type': 'Place', name: 'Bassin d\'Arcachon' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AgencePageClient acteur={acteur} biens={biens} />
    </>
  );
}
