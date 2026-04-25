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

  return {
    title: `${acteur.name} — Agence immobilière | Terrimo`,
    description: desc.slice(0, 160),
    openGraph: {
      title: `${acteur.name} — Agence immobilière`,
      description: desc.slice(0, 160),
      type: 'website',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────
export default async function AgencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const acteur = await fetchActeur(slug, ['agence']);
  if (!acteur) notFound();

  const biens = await fetchBiens(acteur.id);

  return <AgencePageClient acteur={acteur} biens={biens} />;
}
