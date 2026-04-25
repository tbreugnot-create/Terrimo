/**
 * TERRIMO — API Bien individuel
 * GET /api/biens/[id]
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT
        b.id, b.type_annonce, b.type_bien, b.titre, b.description, b.reference,
        b.prix, b.prix_m2, b.surface, b.surface_terrain,
        b.pieces, b.chambres, b.sdb, b.dpe, b.annee_construction,
        b.has_garage, b.has_piscine, b.has_terrasse,
        b.commune, b.adresse, b.code_postal, b.lat, b.lng,
        b.photos, b.video_url, b.is_featured, b.is_active, b.created_at,
        a.id       AS acteur_id,
        a.name     AS acteur_name,
        a.type     AS acteur_type,
        a.slug     AS acteur_slug,
        a.phone    AS acteur_phone,
        a.email    AS acteur_email,
        a.website  AS acteur_website,
        a.address  AS acteur_address,
        a.commune  AS acteur_commune,
        a.google_rating   AS acteur_rating,
        a.google_reviews  AS acteur_reviews,
        a.is_verified     AS acteur_verified
      FROM biens b
      JOIN acteurs a ON a.id = b.acteur_id
      WHERE b.id = ${id}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Bien introuvable' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[GET /api/biens/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
