import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { sql } from '@/lib/db';
import BienPageClient from './BienPageClient';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface BienDetail {
  id: number;
  type_annonce: string;
  type_bien: string;
  titre?: string;
  description?: string;
  reference?: string;
  prix?: number;
  prix_m2?: number;
  surface?: number;
  surface_terrain?: number;
  pieces?: number;
  chambres?: number;
  sdb?: number;
  dpe?: string;
  annee_construction?: number;
  has_garage: boolean;
  has_piscine: boolean;
  has_terrasse: boolean;
  commune?: string;
  adresse?: string;
  code_postal?: string;
  lat?: number;
  lng?: number;
  photos: { url: string; caption?: string }[];
  is_featured: boolean;
  created_at: string;
  // Agence
  acteur_id: number;
  acteur_name: string;
  acteur_type: string;
  acteur_slug?: string;
  acteur_phone?: string;
  acteur_email?: string;
  acteur_website?: string;
  acteur_address?: string;
  acteur_commune?: string;
  acteur_rating?: number;
  acteur_reviews?: number;
  acteur_verified: boolean;
}

// ─────────────────────────────────────────────────────────────
// Fetch côté serveur
// ─────────────────────────────────────────────────────────────
async function fetchBien(id: number): Promise<BienDetail | null> {
  try {
    const rows = await sql`
      SELECT
        b.id, b.type_annonce, b.type_bien, b.titre, b.description, b.reference,
        b.prix, b.prix_m2, b.surface, b.surface_terrain,
        b.pieces, b.chambres, b.sdb, b.dpe, b.annee_construction,
        b.has_garage, b.has_piscine, b.has_terrasse,
        b.commune, b.adresse, b.code_postal, b.lat, b.lng,
        b.photos, b.is_featured, b.created_at,
        a.id AS acteur_id, a.name AS acteur_name, a.type AS acteur_type,
        a.slug AS acteur_slug, a.phone AS acteur_phone, a.email AS acteur_email,
        a.website AS acteur_website, a.address AS acteur_address,
        a.commune AS acteur_commune, a.google_rating AS acteur_rating,
        a.google_reviews AS acteur_reviews, a.is_verified AS acteur_verified
      FROM biens b
      JOIN acteurs a ON a.id = b.acteur_id
      WHERE b.id = ${id} AND b.is_active = true
      LIMIT 1
    `;
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : (row.photos ?? []),
    } as BienDetail;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Metadata SEO
// ─────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return { title: 'Bien introuvable — Terrimo' };

  const bien = await fetchBien(id);
  if (!bien) return { title: 'Bien introuvable — Terrimo' };

  const typeLabel = bien.type_annonce === 'vente' ? 'à vendre' :
                    bien.type_annonce === 'location' ? 'à louer' : bien.type_annonce;
  const prixStr  = bien.prix
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(bien.prix)
    : '';
  const titre    = bien.titre ?? `${bien.type_bien} ${typeLabel} — ${bien.commune}`;
  const desc     = bien.description
    ? bien.description.slice(0, 160)
    : `${bien.type_bien} ${typeLabel} à ${bien.commune}${prixStr ? ` — ${prixStr}` : ''}${bien.surface ? ` · ${bien.surface} m²` : ''}. Découvrez ce bien sur Terrimo, la carte immobilière du Bassin d'Arcachon.`;

  return {
    title: `${titre} — Terrimo`,
    description: desc,
    openGraph: {
      title: `${titre} — Terrimo`,
      description: desc,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Terrimo — Bassin d\'Arcachon',
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default async function BienPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();

  const bien = await fetchBien(id);
  if (!bien) notFound();

  return <BienPageClient bien={bien} />;
}
