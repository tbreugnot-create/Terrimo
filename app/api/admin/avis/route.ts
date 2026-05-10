/**
 * GET  /api/admin/avis?secret=X   → liste tous les avis en attente
 * PATCH /api/admin/avis?secret=X  → approuver / rejeter un avis
 * Body PATCH: { id: number, action: 'approve' | 'reject' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const SECRET = process.env.ADMIN_SECRET ?? 'TERRIMO_ADMIN_2026';

function checkSecret(request: NextRequest): boolean {
  const s = new URL(request.url).searchParams.get('secret');
  return s === SECRET;
}

export async function GET(request: NextRequest) {
  if (!checkSecret(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT av.id, av.acteur_id, av.auteur_nom, av.auteur_email,
             av.note, av.commentaire, av.type_transaction,
             av.is_approved, av.created_at,
             ac.name as acteur_name, ac.type as acteur_type
      FROM avis_acteurs av
      LEFT JOIN acteurs ac ON ac.id = av.acteur_id
      ORDER BY av.created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ avis: rows });
  } catch (err) {
    console.error('[admin/avis GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkSecret(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id, action } = await request.json() as { id?: number; action?: 'approve' | 'reject' };

    if (!id || !['approve', 'reject'].includes(action ?? '')) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    if (action === 'approve') {
      await sql`UPDATE avis_acteurs SET is_approved = true  WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM avis_acteurs WHERE id = ${id}`;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/avis PATCH]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
