import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type    = searchParams.get('type')    || '';
  const commune = searchParams.get('commune') || '';
  const limit   = Math.min(parseInt(searchParams.get('limit') || '3'), 6);

  if (!type) {
    return NextResponse.json({ error: 'type requis' }, { status: 400 });
  }

  try {
    const orderExpr = `is_verified DESC,
      CASE WHEN plan = 'pro' THEN 0 WHEN plan = 'freemium' THEN 1 ELSE 2 END,
      COALESCE(google_rating, 0) DESC`;

    let rows;

    // Essai 1 : commune exacte
    if (commune) {
      rows = await sql`
        SELECT id, name, type, slug, phone, email, website,
               commune, google_rating, google_reviews, is_verified, plan, meta
        FROM acteurs
        WHERE is_active = true
          AND type = ${type}
          AND commune ILIKE ${'%' + commune + '%'}
        ORDER BY is_verified DESC,
                 CASE WHEN plan = 'pro' THEN 0 WHEN plan = 'freemium' THEN 1 ELSE 2 END,
                 COALESCE(google_rating, 0) DESC
        LIMIT ${limit}
      `;
    }

    // Fallback : top tous bassin
    if (!rows || rows.length === 0) {
      rows = await sql`
        SELECT id, name, type, slug, phone, email, website,
               commune, google_rating, google_reviews, is_verified, plan, meta
        FROM acteurs
        WHERE is_active = true AND type = ${type}
        ORDER BY is_verified DESC,
                 CASE WHEN plan = 'pro' THEN 0 WHEN plan = 'freemium' THEN 1 ELSE 2 END,
                 COALESCE(google_rating, 0) DESC
        LIMIT ${limit}
      `;
    }

    const result = rows.map((r: Record<string, unknown>) => ({
      ...r,
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta as string) : (r.meta ?? {}),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('[acteurs-locaux]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
