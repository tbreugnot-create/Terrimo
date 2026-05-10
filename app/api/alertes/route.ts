/**
 * TERRIMO — POST /api/alertes
 * Crée une alerte zone : stocke le polygone, sync Odoo, envoie l'email de confirmation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { emailAlerteConfirmation } from '@/lib/email';
import { syncAlerteToOdoo } from '@/lib/odoo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, polygon, type_annonce, prix_max, surface_min } = body;

    if (!email || !polygon || !Array.isArray(polygon) || polygon.length < 3) {
      return NextResponse.json(
        { error: 'email et polygon (≥3 points) requis' },
        { status: 400 }
      );
    }

    // Validation email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Créer l'alerte en base
    const rows = await sql`
      INSERT INTO zone_alertes (email, polygon, type_annonce, prix_max, surface_min)
      VALUES (
        ${email},
        ${JSON.stringify(polygon)},
        ${type_annonce ?? null},
        ${prix_max ? Number(prix_max) : null},
        ${surface_min ? Number(surface_min) : null}
      )
      RETURNING id
    `;

    const alerteId = rows[0]?.id as string;
    if (!alerteId) throw new Error('Insert failed');

    // Fire & forget : sync Odoo + email confirmation
    Promise.all([
      syncAlerteToOdoo({ email, type_annonce, prix_max, surface_min, alerteId }).then(odooId => {
        if (odooId) {
          sql`UPDATE zone_alertes SET odoo_partner_id = ${odooId} WHERE id = ${alerteId}`.catch(() => {});
        }
      }),
      emailAlerteConfirmation({ email, type_annonce, prix_max, surface_min, alerteId }),
    ]).catch(err => console.error('[alertes] fire&forget error', err));

    return NextResponse.json({ success: true, alerteId });
  } catch (err) {
    console.error('[POST /api/alertes]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
