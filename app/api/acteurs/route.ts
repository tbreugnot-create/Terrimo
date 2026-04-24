/**
 * TERRIMO — API Acteurs
 * GET /api/acteurs?type=agence&commune=Arcachon&plan=premium
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type    = searchParams.get('type');      // agence|notaire|diagnostiqueur|conciergerie
  const commune = searchParams.get('commune');
  const plan    = searchParams.get('plan');

  try {
    let rows;

    if (type && commune) {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND type = ${type} AND commune = ${commune}
        ORDER BY
          CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END,
          google_rating DESC NULLS LAST
      `;
    } else if (type) {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND type = ${type}
        ORDER BY
          CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END,
          google_rating DESC NULLS LAST
      `;
    } else if (commune) {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND commune = ${commune}
        ORDER BY type, CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END
      `;
    } else {
      // Tous les acteurs — pour charger la carte complète
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND lat IS NOT NULL AND lng IS NOT NULL
        ORDER BY type, CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END
      `;
    }

    // Stats par type pour le bandeau de comptage
    const stats = await sql`
      SELECT type, COUNT(*) as nb
      FROM acteurs WHERE is_active = true
      GROUP BY type
    `;

    return NextResponse.json({
      acteurs: rows,
      stats: Object.fromEntries(stats.map((s: { type: string; nb: string }) => [s.type, parseInt(s.nb)])),
    });

  } catch (error) {
    console.error('Erreur /api/acteurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
