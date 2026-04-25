/**
 * TERRIMO — GET /api/pro/search
 * Recherche un acteur existant pour le self-onboarding pro
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q    = searchParams.get('q')?.trim() ?? '';
  const type = searchParams.get('type') ?? '';

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const rows = await sql`
      SELECT id, type, name, commune, address, phone, email, plan, is_verified
      FROM acteurs
      WHERE is_active = true
        AND (
          name      ILIKE ${'%' + q + '%'}
          OR commune ILIKE ${'%' + q + '%'}
          OR address ILIKE ${'%' + q + '%'}
        )
        ${type ? sql`AND type = ${type}` : sql``}
      ORDER BY
        CASE WHEN name ILIKE ${q + '%'} THEN 0 ELSE 1 END,
        name
      LIMIT 10
    `;

    return NextResponse.json({ results: rows });
  } catch (error) {
    console.error('Erreur /api/pro/search:', error);
    return NextResponse.json({ results: [] });
  }
}
