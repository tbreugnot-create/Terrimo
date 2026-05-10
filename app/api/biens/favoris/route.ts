/**
 * GET /api/biens/favoris?ids=1,2,3
 * Retourne les biens dont les IDs sont dans la liste.
 * Max 50 IDs pour éviter les abus.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('ids') ?? '';

  const ids = raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0)
    .slice(0, 50);

  if (!ids.length) {
    return NextResponse.json({ biens: [] });
  }

  try {
    const rows = await sql`
      SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
             b.pieces, b.commune, b.adresse, b.dpe, b.photos,
             b.is_featured, b.created_at,
             a.name as acteur_name, a.slug as acteur_slug
      FROM biens b
      LEFT JOIN acteurs a ON a.id = b.acteur_id
      WHERE b.id = ANY(${ids}::int[]) AND b.is_active = true
      ORDER BY b.is_featured DESC, b.created_at DESC
    `;

    const biens = rows.map((r: Record<string, unknown>) => ({
      ...r,
      photos: typeof r.photos === 'string' ? JSON.parse(r.photos as string) : (r.photos ?? []),
    }));

    return NextResponse.json({ biens });
  } catch (err) {
    console.error('[favoris API]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
