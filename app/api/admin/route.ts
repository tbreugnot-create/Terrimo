/**
 * TERRIMO — API Admin
 * Sécurisée par ADMIN_SECRET env var
 *
 * GET  /api/admin?secret=XXX&action=stats|acteurs|leads
 * POST /api/admin — body: { secret, action, acteur_id, value }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function checkSecret(secret: string | null): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || adminSecret === 'change_me') return false;
  return secret === adminSecret;
}

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  const action = searchParams.get('action') ?? 'stats';

  if (!checkSecret(secret)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    if (action === 'stats') {
      const [planStats, recentLeads, mandatsCount, biensCount] = await Promise.all([
        sql`
          SELECT plan, COUNT(*)::int AS nb, COUNT(*) FILTER (WHERE is_active)::int AS actifs
          FROM acteurs GROUP BY plan ORDER BY plan
        `,
        sql`SELECT COUNT(*)::int AS nb FROM leads WHERE created_at >= NOW() - INTERVAL '7 days'`,
        sql`SELECT COUNT(*)::int AS nb FROM mandats_recherche WHERE is_active = true AND expires_at > NOW()`.catch(() => [{ nb: 0 }]),
        sql`SELECT COUNT(*)::int AS nb FROM biens WHERE is_active = true`,
      ]);
      return NextResponse.json({ planStats, recentLeads: recentLeads[0]?.nb ?? 0, mandatsCount: mandatsCount[0]?.nb ?? 0, biensCount: biensCount[0]?.nb ?? 0 });
    }

    if (action === 'acteurs') {
      const page = Number(searchParams.get('page') ?? 0);
      const filter = searchParams.get('filter') ?? 'pending';
      const rows = await sql`
        SELECT
          id, name, type, slug, plan, email, phone, commune,
          is_active, is_verified, access_token, created_at, updated_at,
          stripe_customer_id IS NOT NULL AS has_stripe
        FROM acteurs
        WHERE
          CASE ${filter}
            WHEN 'pending'  THEN NOT is_active
            WHEN 'active'   THEN is_active = true
            WHEN 'premium'  THEN plan IN ('pro', 'premium') AND is_active = true
            ELSE true
          END
        ORDER BY created_at DESC
        LIMIT 30 OFFSET ${page * 30}
      `;
      const countRow = await sql`
        SELECT COUNT(*)::int AS nb FROM acteurs
        WHERE CASE ${filter}
          WHEN 'pending' THEN NOT is_active
          WHEN 'active'  THEN is_active = true
          WHEN 'premium' THEN plan IN ('pro', 'premium') AND is_active = true
          ELSE true
        END
      `;
      return NextResponse.json({ acteurs: rows, total: countRow[0]?.nb ?? 0 });
    }

    if (action === 'leads') {
      const rows = await sql`
        SELECT id, name, email, phone, commune, source, type_local,
               surface, estimation_centrale, status, created_at
        FROM leads
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return NextResponse.json({ leads: rows });
    }

    if (action === 'mandats') {
      const rows = await sql`
        SELECT id, prenom, email, communes, budget_max, mode_financement,
               accord_bancaire, horizon, is_active, created_at
        FROM mandats_recherche
        ORDER BY created_at DESC
        LIMIT 50
      `.catch(() => []);
      return NextResponse.json({ mandats: rows });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });

  } catch (err) {
    console.error('[/api/admin GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json() as {
    secret: string;
    action: string;
    acteur_id?: number;
    value?: boolean | string;
    lead_id?: number;
  };

  if (!checkSecret(body.secret)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Activer / désactiver un acteur
    if (body.action === 'set_active' && body.acteur_id != null) {
      await sql`
        UPDATE acteurs
        SET is_active = ${body.value as boolean}, updated_at = NOW()
        WHERE id = ${body.acteur_id}
      `;

      // Si activation → envoyer email d'onboarding
      if (body.value === true) {
        const rows = await sql`SELECT email, name, plan, access_token FROM acteurs WHERE id = ${body.acteur_id}`;
        if (rows.length) {
          const a = rows[0] as { email: string; name: string; plan: string; access_token: string };
          const { emailOnboardingPro } = await import('@/lib/email');
          emailOnboardingPro({ email: a.email, name: a.name, plan: a.plan, dashboardToken: a.access_token }).catch(() => {});
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Passer un acteur en premium manuellement (override)
    if (body.action === 'set_plan' && body.acteur_id != null) {
      await sql`
        UPDATE acteurs
        SET plan = ${body.value as string}, updated_at = NOW()
        WHERE id = ${body.acteur_id}
      `;
      return NextResponse.json({ ok: true });
    }

    // Passer is_verified
    if (body.action === 'set_verified' && body.acteur_id != null) {
      await sql`
        UPDATE acteurs
        SET is_verified = ${body.value as boolean}, updated_at = NOW()
        WHERE id = ${body.acteur_id}
      `;
      return NextResponse.json({ ok: true });
    }

    // Supprimer un lead
    if (body.action === 'delete_lead' && body.lead_id != null) {
      await sql`DELETE FROM leads WHERE id = ${body.lead_id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });

  } catch (err) {
    console.error('[/api/admin POST]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
