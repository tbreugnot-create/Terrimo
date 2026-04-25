/**
 * TERRIMO — GET/PUT /api/pro/fiche
 * Auth par token (access_token sur acteurs)
 * Plan gating : Free = lecture seule, Pro/Premium = éditable
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// ── GET /api/pro/fiche?token=xxx ──────────────────────────────
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });

  try {
    const rows = await sql`
      SELECT
        a.id, a.type, a.name, a.slug, a.plan, a.email, a.phone, a.website,
        a.address, a.commune, a.code_postal, a.description, a.logo_url,
        a.google_rating, a.google_reviews, a.is_verified, a.is_active,
        a.meta, a.created_at,
        -- Leads reçus (si pro/premium)
        CASE WHEN a.plan IN ('pro','premium') THEN (
          SELECT json_agg(json_build_object(
            'id', l.id, 'name', l.name, 'email', l.email, 'phone', l.phone,
            'type_local', l.type_local, 'surface', l.surface,
            'estimation_centrale', l.estimation_centrale,
            'status', l.status, 'created_at', l.created_at
          ) ORDER BY l.created_at DESC)
          FROM leads l WHERE l.commune = a.commune
          AND l.created_at > NOW() - INTERVAL '90 days'
        ) ELSE NULL END AS leads_recents,
        -- Biens en portefeuille
        CASE WHEN a.plan IN ('pro','premium') THEN (
          SELECT json_agg(json_build_object(
            'id', b.id, 'type_annonce', b.type_annonce, 'type_bien', b.type_bien,
            'titre', b.titre, 'prix', b.prix, 'surface', b.surface, 'commune', b.commune,
            'pieces', b.pieces, 'is_active', b.is_active, 'is_featured', b.is_featured,
            'created_at', b.created_at
          ) ORDER BY b.created_at DESC)
          FROM biens b WHERE b.acteur_id = a.id AND b.is_active = true
        ) ELSE NULL END AS biens
      FROM acteurs a
      WHERE a.access_token = ${token}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
    }

    return NextResponse.json({ acteur: rows[0] });
  } catch (error) {
    console.error('GET /api/pro/fiche error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ── PUT /api/pro/fiche ────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });

  try {
    // Vérifier le plan
    const check = await sql`
      SELECT id, plan FROM acteurs WHERE access_token = ${token} LIMIT 1
    `;
    if (!check.length) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

    const { id, plan } = check[0] as { id: number; plan: string };

    if (plan === 'free') {
      return NextResponse.json({
        error: 'Édition réservée aux plans Pro et Premium',
        upgrade_required: true,
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, email, website, address, commune, description } = body;

    await sql`
      UPDATE acteurs SET
        name        = COALESCE(NULLIF(${name ?? ''}, ''), name),
        phone       = COALESCE(NULLIF(${phone ?? ''}, ''), phone),
        email       = COALESCE(NULLIF(${email ?? ''}, ''), email),
        website     = COALESCE(NULLIF(${website ?? ''}, ''), website),
        address     = COALESCE(NULLIF(${address ?? ''}, ''), address),
        commune     = COALESCE(NULLIF(${commune ?? ''}, ''), commune),
        description = ${description ?? null},
        updated_at  = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/pro/fiche error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
