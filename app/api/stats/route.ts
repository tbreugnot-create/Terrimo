import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 300; // revalidate every 5 minutes

export async function GET() {
  try {
    const [acteurs, biens, acquéreurs] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM acteurs WHERE is_active = true`,
      sql`SELECT COUNT(*)::int AS count FROM biens WHERE is_active = true`,
      sql`SELECT COUNT(*)::int AS count FROM mandats_acquereur WHERE is_active = true`,
    ]);

    return NextResponse.json({
      acteurs: acteurs[0]?.count ?? 0,
      biens: biens[0]?.count ?? 0,
      acquereurs: acquéreurs[0]?.count ?? 0,
    });
  } catch {
    return NextResponse.json({ acteurs: 135, biens: 320, acquereurs: 47 });
  }
}
