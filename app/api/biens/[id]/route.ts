/**
 * TERRIMO — API Bien individuel
 * GET  /api/biens/[id]                — public
 * PATCH /api/biens/[id]?token=xxx     — pro : modifier prix/titre/description/is_active
 * DELETE /api/biens/[id]?token=xxx    — pro : désactiver (soft delete)
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

// ── PATCH /api/biens/[id]?token=xxx ──────────────────────────────────────────
// Champs modifiables : titre, description, prix, is_active, is_featured
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

  try {
    // Auth : vérifier que le bien appartient bien à l'acteur authentifié
    const auth = await sql`
      SELECT b.id
      FROM biens b
      JOIN acteurs a ON a.id = b.acteur_id
      WHERE b.id = ${id}
        AND a.access_token = ${token}
        AND a.plan IN ('pro', 'premium')
        AND a.is_active = true
      LIMIT 1
    `;
    if (!auth.length) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const body = await request.json() as {
      titre?: string;
      description?: string;
      prix?: number;
      is_active?: boolean;
      is_featured?: boolean;
    };

    await sql`
      UPDATE biens SET
        titre       = COALESCE(${body.titre ?? null}, titre),
        description = COALESCE(${body.description ?? null}, description),
        prix        = COALESCE(${body.prix ?? null}, prix),
        is_active   = COALESCE(${body.is_active ?? null}, is_active),
        is_featured = COALESCE(${body.is_featured ?? null}, is_featured),
        updated_at  = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/biens/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ── DELETE /api/biens/[id]?token=xxx ─────────────────────────────────────────
// Soft delete : is_active = false
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

  try {
    const auth = await sql`
      SELECT b.id
      FROM biens b
      JOIN acteurs a ON a.id = b.acteur_id
      WHERE b.id = ${id}
        AND a.access_token = ${token}
        AND a.plan IN ('pro', 'premium')
        AND a.is_active = true
      LIMIT 1
    `;
    if (!auth.length) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    await sql`UPDATE biens SET is_active = false, updated_at = NOW() WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: 'Bien désactivé' });
  } catch (err) {
    console.error('[DELETE /api/biens/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
