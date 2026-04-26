import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 300; // cache 5min

export async function GET(request: NextRequest) {
  const commune = request.nextUrl.searchParams.get('commune');
  const plan = request.nextUrl.searchParams.get('plan');

  try {
    const rows = commune
      ? await sql`
          SELECT id, name, slug, commune, type, plan,
                 phone, email, website, google_rating, google_reviews,
                 lat, lng, is_recommended, description
          FROM agencies
          WHERE is_active = true AND commune ILIKE ${'%' + commune + '%'}
          ORDER BY
            CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END,
            is_recommended DESC,
            google_rating DESC NULLS LAST
        `
      : await sql`
          SELECT id, name, slug, commune, type, plan,
                 phone, email, website, google_rating, google_reviews,
                 lat, lng, is_recommended, description
          FROM agencies
          WHERE is_active = true
          ORDER BY
            CASE plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END,
            is_recommended DESC,
            google_rating DESC NULLS LAST
        `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Erreur agencies:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
