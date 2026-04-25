import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import ConciergiePageClient from './ConciergiePageClient';
import type { ActeurDetail, BienPreview } from '@/lib/terrimo-types';

// ─── Fetch ────────────────────────────────────────────────
async function fetchConciergerie(slug: string): Promise<ActeurDetail | null> {
  try {
    const rows = await sql`
      SELECT id, name, type, slug, phone, email, website, address,
             commune, google_rating, google_reviews, is_verified, plan, meta
      FROM acteurs
      WHERE slug = ${slug} AND type = 'conciergerie' AND is_active = true
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

async function fetchBiensGeres(acteurId: number): Promise<BienPreview[]> {
  try {
    const rows = await sql`
      SELECT id, type_annonce, type_bien, titre, prix, surface, pieces, commune, photos, is_featured
      FROM biens
      WHERE acteur_id = ${acteurId} AND is_active = true AND type_annonce = 'location'
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 9
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
  const c = await fetchConciergerie(slug);
  if (!c) return { title: 'Conciergerie introuvable — Terrimo' };

  const services = c.meta?.services ?? [];
  const desc = c.meta?.description
    ?? `${c.name} — Conciergerie à ${c.commune ?? 'Bassin d\'Arcachon'}. ${services.slice(0, 3).join(', ')}. Gestion locative saisonnière sur le Bassin d\'Arcachon.`;

  return {
    title: `${c.name} — Conciergerie | Terrimo`,
    description: desc.slice(0, 160),
    openGraph: {
      title: `${c.name} — Conciergerie`,
      description: desc.slice(0, 160),
      type: 'website',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────
export default async function ConciergiePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const conciergerie = await fetchConciergerie(slug);
  if (!conciergerie) notFound();

  const biensGeres = await fetchBiensGeres(conciergerie.id);

  return <ConciergiePageClient conciergerie={conciergerie} biensGeres={biensGeres} />;
}
