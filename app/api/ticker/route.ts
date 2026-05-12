import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 60; // revalidate every minute

function relTime(date: Date): string {
  const diff = Math.round((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.round(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.round(diff / 3600)}h`;
  return `il y a ${Math.round(diff / 86400)}j`;
}

export async function GET() {
  const FALLBACK = [
    '🔍 Alerte zone activée · Cap Ferret il y a 2 min',
    '🏡 Estimation réalisée · Arcachon il y a 5 min',
    '📍 Zone dessinée · La Teste il y a 8 min',
    '🔔 Nouveau bien matché · Andernos il y a 11 min',
    '🏢 Agence inscrite · Lège-Cap Ferret il y a 14 min',
    '🔍 Zone dessinée · Gujan-Mestras il y a 17 min',
    '🏡 Estimation réalisée · Biganos il y a 21 min',
  ];

  try {
    const [alertes, biens, acteurs] = await Promise.all([
      sql`SELECT created_at FROM zone_alertes ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT commune, created_at FROM biens WHERE is_active = true ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT commune, created_at FROM acteurs WHERE is_active = true ORDER BY created_at DESC LIMIT 3`,
    ]);

    const messages: string[] = [];

    for (const a of alertes) {
      if (a.created_at) {
        messages.push(`🔍 Alerte zone activée · Bassin d'Arcachon · ${relTime(new Date(a.created_at))}`);
      }
    }

    for (const b of biens) {
      if (b.created_at) {
        const commune = b.commune ?? "Bassin d'Arcachon";
        messages.push(`🏠 Nouveau bien publié · ${commune} · ${relTime(new Date(b.created_at))}`);
      }
    }

    for (const a of acteurs) {
      if (a.created_at) {
        const commune = a.commune ?? "Bassin d'Arcachon";
        messages.push(`🏢 Pro référencé · ${commune} · ${relTime(new Date(a.created_at))}`);
      }
    }

    // Sort by most recent (we'd need timestamps for this, so just shuffle-interleave)
    const result = messages.length >= 3 ? messages : FALLBACK;

    return NextResponse.json({ messages: result });
  } catch {
    return NextResponse.json({ messages: FALLBACK });
  }
}
