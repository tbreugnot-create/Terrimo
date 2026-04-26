/**
 * TERRIMO — GET /api/pro/acquereurs?token=xxx
 *
 * Retourne les mandats de recherche actifs qui matchent
 * la commune de l'agence authentifiée par token.
 *
 * Gating freemium :
 *   free    → count seulement (teaser)
 *   pro     → profils avec budget/type/communes, email/tél masqués
 *   premium → coordonnées complètes (prénom, email, téléphone)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });

  try {
    // ── Auth + récupération commune ────────────────────────────
    const actors = await sql`
      SELECT id, plan, commune
      FROM acteurs
      WHERE access_token = ${token}
        AND is_active = true
      LIMIT 1
    `;

    if (!actors.length) {
      return NextResponse.json({ error: 'Token invalide ou compte inactif' }, { status: 401 });
    }

    const { plan, commune } = actors[0] as { id: number; plan: string; commune: string | null };

    if (!commune) {
      return NextResponse.json({ acquereurs: [], total: 0, plan });
    }

    // ── Count total (tous plans) ───────────────────────────────
    const countRows = await sql`
      SELECT COUNT(*)::int AS total
      FROM mandats_recherche
      WHERE is_active = true
        AND expires_at > NOW()
        AND communes && ARRAY[${commune.toLowerCase()}, ${commune}]::text[]
    `;
    const total = (countRows[0] as { total: number }).total;

    // Plan free → juste le count pour l'affichage teaser
    if (plan === 'free') {
      return NextResponse.json({ acquereurs: [], total, plan });
    }

    // ── Récupération des mandats (pro + premium) ───────────────
    const rows = await sql`
      SELECT
        id,
        communes,
        types_bien,
        surface_min,
        surface_max,
        chambres_min,
        budget_max,
        mode_financement,
        accord_bancaire,
        type_acquisition,
        horizon,
        description,
        caracteristiques,
        created_at,
        -- Coordonnées complètes seulement en premium
        CASE WHEN ${plan} = 'premium' THEN prenom ELSE NULL END AS prenom,
        CASE WHEN ${plan} = 'premium' THEN email  ELSE NULL END AS email,
        CASE WHEN ${plan} = 'premium' THEN phone  ELSE NULL END AS phone
      FROM mandats_recherche
      WHERE is_active = true
        AND expires_at > NOW()
        AND communes && ARRAY[${commune.toLowerCase()}, ${commune}]::text[]
      ORDER BY
        -- Financement comptant / accord bancaire en premier
        (mode_financement = 'comptant') DESC,
        accord_bancaire DESC,
        created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ acquereurs: rows, total, plan });

  } catch (error) {
    console.error('GET /api/pro/acquereurs error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
