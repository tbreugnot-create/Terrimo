/**
 * TERRIMO — POST /api/events
 * Tracking léger des événements (vues, clics, partages)
 * RGPD-friendly : pas d'IP stockée, hash SHA-256 tronqué
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const VALID_EVENTS = ['view', 'contact_click', 'phone_click', 'share', 'soft_gate'] as const;
type EventType = (typeof VALID_EVENTS)[number];

// Hash SHA-256 léger (premiers 16 chars) pour unicité sans IP brute
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.CRON_SECRET ?? 'salt_terrimo');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      bien_id?: number;
      acteur_id?: number;
      event_type?: string;
      session_id?: string;
    };

    const { bien_id, acteur_id, event_type, session_id } = body;

    if (!bien_id || !event_type || !VALID_EVENTS.includes(event_type as EventType)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // IP hash pour déduplications RGPD
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
            ?? request.headers.get('x-real-ip')
            ?? '0.0.0.0';
    const ipHash = await hashIp(ip);

    // Déduplique les "view" par session (1 vue par session par bien)
    if (event_type === 'view' && session_id) {
      try {
        const existing = await sql`
          SELECT id FROM bien_events
          WHERE bien_id = ${bien_id}
            AND event_type = 'view'
            AND session_id = ${session_id}
            AND created_at > NOW() - INTERVAL '1 hour'
          LIMIT 1
        `;
        if (existing.length) {
          return NextResponse.json({ ok: true, deduplicated: true });
        }
      } catch { /* table pas encore créée → on continue */ }
    }

    await sql`
      INSERT INTO bien_events (bien_id, acteur_id, event_type, ip_hash, session_id)
      VALUES (
        ${bien_id},
        ${acteur_id ?? null},
        ${event_type},
        ${ipHash},
        ${session_id ?? null}
      )
    `.catch(() => {}); // Silencieux si table absente

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/events]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
