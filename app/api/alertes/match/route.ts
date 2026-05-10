/**
 * TERRIMO — GET /api/alertes/match
 * Cron Vercel (toutes les heures) :
 *   1. Charge tous les biens publiés dans les dernières 2h
 *   2. Pour chaque alerte active, vérifie quels biens tombent dans le polygone
 *   3. Envoie un email groupé par alerte si ≥1 match
 *   4. Met à jour last_matched_at
 *
 * Sécurisé par CRON_SECRET (header Authorization: Bearer <secret>)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { emailNouveauBienZone } from '@/lib/email';

// ── Ray-casting point-in-polygon (même algo que Map.tsx) ──────────────────────
function ptInPoly(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if ((yi > lng) !== (yj > lng) && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev : pas de secret → open
  const auth = request.headers.get('authorization') ?? '';
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Biens publiés dans les 2 dernières heures avec coordonnées
    const biens = await sql`
      SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
             b.pieces, b.commune, b.lat, b.lng, b.created_at,
             a.name as acteur_name
      FROM biens b
      LEFT JOIN acteurs a ON a.id = b.acteur_id
      WHERE b.is_active = true
        AND b.lat IS NOT NULL
        AND b.lng IS NOT NULL
        AND b.created_at >= NOW() - INTERVAL '2 hours'
      ORDER BY b.created_at DESC
      LIMIT 200
    `;

    if (biens.length === 0) {
      return NextResponse.json({ matched: 0, message: 'Aucun bien récent' });
    }

    // 2. Toutes les alertes actives
    const alertes = await sql`
      SELECT id, email, polygon, type_annonce, prix_max, surface_min, last_matched_at
      FROM zone_alertes
      WHERE is_active = true
    `;

    if (alertes.length === 0) {
      return NextResponse.json({ matched: 0, message: 'Aucune alerte active' });
    }

    let totalEmails = 0;
    const updates: Promise<unknown>[] = [];

    for (const alerte of alertes) {
      // Polygone stocké en JSONB : [[lat,lng], ...]
      const poly = alerte.polygon as [number, number][];
      if (!Array.isArray(poly) || poly.length < 3) continue;

      // Fenêtre : on ne renvoie que les biens APRÈS last_matched_at si défini
      const since = alerte.last_matched_at ? new Date(alerte.last_matched_at) : null;

      const matches = biens.filter(b => {
        // Filtre temporel (évite les doublons si cron se chevauche)
        if (since && new Date(b.created_at) <= since) return false;
        // Filtre géographique
        if (!ptInPoly(b.lat, b.lng, poly)) return false;
        // Filtres optionnels
        if (alerte.type_annonce && b.type_annonce !== alerte.type_annonce) return false;
        if (alerte.prix_max && b.prix && b.prix > alerte.prix_max) return false;
        if (alerte.surface_min && b.surface && b.surface < alerte.surface_min) return false;
        return true;
      });

      if (matches.length === 0) continue;

      // Envoyer l'email
      await emailNouveauBienZone({
        email: alerte.email,
        alerteId: alerte.id,
        biens: matches.map(b => ({
          id: b.id,
          titre: b.titre,
          type_bien: b.type_bien,
          type_annonce: b.type_annonce,
          prix: b.prix,
          surface: b.surface,
          pieces: b.pieces,
          commune: b.commune,
          acteur_name: b.acteur_name,
        })),
      });

      totalEmails++;

      // Mettre à jour last_matched_at
      updates.push(
        sql`UPDATE zone_alertes SET last_matched_at = NOW() WHERE id = ${alerte.id}`
      );
    }

    await Promise.allSettled(updates);

    return NextResponse.json({
      matched: totalEmails,
      biens_scanned: biens.length,
      alertes_checked: alertes.length,
    });
  } catch (err) {
    console.error('[/api/alertes/match]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
