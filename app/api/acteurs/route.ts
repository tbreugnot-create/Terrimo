/**
 * TERRIMO — API Acteurs
 * GET /api/acteurs?type=agence&commune=Arcachon
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type    = searchParams.get('type');
  const commune = searchParams.get('commune');

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[] = [];

    if (type && commune) {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND type = ${type} AND commune ILIKE ${'%' + commune + '%'}
        ORDER BY CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END,
                 google_rating DESC NULLS LAST
      `;
    } else if (type) {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND type = ${type}
        ORDER BY CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END,
                 google_rating DESC NULLS LAST
      `;
    } else if (commune) {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND commune ILIKE ${'%' + commune + '%'}
        ORDER BY type, CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END
      `;
    } else {
      rows = await sql`
        SELECT id, type, name, slug, plan, phone, email, website, logo_url,
               address, commune, code_postal, lat, lng,
               google_rating, google_reviews, meta, is_verified
        FROM acteurs
        WHERE is_active = true AND lat IS NOT NULL AND lng IS NOT NULL
        ORDER BY type, CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END
      `;
    }

    // Stats par type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statsRows: any[] = await sql`
      SELECT type, COUNT(*) as nb FROM acteurs WHERE is_active = true GROUP BY type
    `;
    const stats: Record<string, number> = {};
    for (const s of statsRows) {
      stats[String(s.type)] = parseInt(String(s.nb));
    }

    return NextResponse.json({ acteurs: rows, stats });

  } catch (error) {
    console.error('Erreur /api/acteurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
