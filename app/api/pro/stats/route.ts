/**
 * TERRIMO — GET /api/pro/stats?token=xxx
 * Stats dashboard pour les acteurs pro/premium
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 300; // cache 5 min

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });

  try {
    // ── Auth ────────────────────────────────────────────────
    const actors = await sql`
      SELECT id, plan, commune
      FROM acteurs
      WHERE access_token = ${token} AND is_active = true
      LIMIT 1
    `;
    if (!actors.length) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    const { id: acteurId, plan, commune } = actors[0] as { id: number; plan: string; commune: string };

    // ── Biens stats ─────────────────────────────────────────
    const biensStats = await sql`
      SELECT
        COUNT(*)::int                                                   AS total,
        COUNT(*) FILTER (WHERE is_active = true)::int                   AS actifs,
        COUNT(*) FILTER (WHERE is_featured = true)::int                 AS featured,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS recents_30j
      FROM biens
      WHERE acteur_id = ${acteurId}
    `;

    // ── Leads par commune (30j / 90j) ───────────────────────
    const leadsStats = await sql`
      SELECT
        COUNT(*)::int                                                   AS total_90j,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS total_30j,
        COUNT(*) FILTER (WHERE status = 'new')::int                     AS non_lus
      FROM leads
      WHERE commune = ${commune}
        AND created_at >= NOW() - INTERVAL '90 days'
    `;

    // ── Mandats de recherche actifs dans la commune ──────────
    let mandatsCount = 0;
    try {
      const mandatsRows = await sql`
        SELECT COUNT(*)::int AS nb
        FROM mandats_recherche
        WHERE communes @> ${JSON.stringify([commune])}::jsonb
          AND is_active = true
      `;
      mandatsCount = mandatsRows[0]?.nb ?? 0;
    } catch { /* table peut ne pas exister */ }

    // ── Zone alertes actives pour la commune ─────────────────
    let alertesCount = 0;
    try {
      const alertesRows = await sql`SELECT COUNT(*)::int AS nb FROM zone_alertes WHERE is_active = true`;
      alertesCount = alertesRows[0]?.nb ?? 0;
    } catch { /* table peut ne pas exister */ }

    // ── Performance par type de bien (plan pro+) ─────────────
    let parType: unknown[] = [];
    if (plan !== 'free') {
      const typeRows = await sql`
        SELECT
          type_annonce, type_bien,
          COUNT(*)::int AS nb,
          ROUND(AVG(prix)::numeric, 0)::int AS prix_moyen
        FROM biens
        WHERE acteur_id = ${acteurId} AND is_active = true
        GROUP BY type_annonce, type_bien
        ORDER BY nb DESC
        LIMIT 8
      `;
      parType = typeRows;
    }

    // ── Events analytics (bien_events) ──────────────────────
    let analytics = { views_30j: 0, contacts_30j: 0, phones_30j: 0, shares_30j: 0 };
    try {
      const evRows = await sql`
        SELECT
          COUNT(*) FILTER (WHERE event_type = 'view')          AS views_30j,
          COUNT(*) FILTER (WHERE event_type = 'contact_click') AS contacts_30j,
          COUNT(*) FILTER (WHERE event_type = 'phone_click')   AS phones_30j,
          COUNT(*) FILTER (WHERE event_type = 'share')         AS shares_30j
        FROM bien_events
        WHERE acteur_id = ${acteurId}
          AND created_at >= NOW() - INTERVAL '30 days'
      `;
      if (evRows.length) {
        analytics = {
          views_30j:    Number(evRows[0].views_30j)    || 0,
          contacts_30j: Number(evRows[0].contacts_30j) || 0,
          phones_30j:   Number(evRows[0].phones_30j)   || 0,
          shares_30j:   Number(evRows[0].shares_30j)   || 0,
        };
      }
    } catch { /* table pas encore créée */ }

    return NextResponse.json({
      plan,
      commune,
      biens: biensStats[0] ?? { total: 0, actifs: 0, featured: 0, recents_30j: 0 },
      leads: leadsStats[0] ?? { total_90j: 0, total_30j: 0, non_lus: 0 },
      mandats_actifs: mandatsCount,
      alertes_zone: alertesCount,
      par_type: parType,
      analytics,
    });

  } catch (error) {
    console.error('/api/pro/stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
