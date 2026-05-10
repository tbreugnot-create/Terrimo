/**
 * GET  /api/avis?acteur_id=X   → avis approuvés d'un acteur (+ stats)
 * POST /api/avis                → soumettre un avis (pending modération)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// ─── Auto-migration ────────────────────────────────────────
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS avis_acteurs (
      id              SERIAL PRIMARY KEY,
      acteur_id       INTEGER NOT NULL,
      auteur_nom      VARCHAR(120) NOT NULL,
      auteur_email    VARCHAR(255) NOT NULL,
      note            SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
      commentaire     TEXT NOT NULL,
      type_transaction VARCHAR(30) DEFAULT 'achat',
      is_approved     BOOLEAN DEFAULT FALSE,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_avis_unique_email_acteur
      ON avis_acteurs(acteur_id, auteur_email)
  `;
}

// ─── GET ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const acteurId = parseInt(searchParams.get('acteur_id') ?? '', 10);

  if (!acteurId || isNaN(acteurId)) {
    return NextResponse.json({ error: 'acteur_id requis' }, { status: 400 });
  }

  try {
    await ensureTable();

    const [avisRows, statsRows] = await Promise.all([
      sql`
        SELECT id, auteur_nom, note, commentaire, type_transaction, created_at
        FROM avis_acteurs
        WHERE acteur_id = ${acteurId} AND is_approved = true
        ORDER BY created_at DESC
        LIMIT 20
      `,
      sql`
        SELECT
          COUNT(*)::int            AS total,
          ROUND(AVG(note)::numeric, 1) AS moyenne,
          COUNT(*) FILTER (WHERE note = 5)::int AS n5,
          COUNT(*) FILTER (WHERE note = 4)::int AS n4,
          COUNT(*) FILTER (WHERE note = 3)::int AS n3,
          COUNT(*) FILTER (WHERE note = 2)::int AS n2,
          COUNT(*) FILTER (WHERE note = 1)::int AS n1
        FROM avis_acteurs
        WHERE acteur_id = ${acteurId} AND is_approved = true
      `,
    ]);

    const stats = statsRows[0] ?? { total: 0, moyenne: null, n5: 0, n4: 0, n3: 0, n2: 0, n1: 0 };

    return NextResponse.json({ avis: avisRows, stats });
  } catch (err) {
    console.error('[GET /api/avis]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── POST ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      acteur_id?: number;
      auteur_nom?: string;
      auteur_email?: string;
      note?: number;
      commentaire?: string;
      type_transaction?: string;
    };

    const { acteur_id, auteur_nom, auteur_email, note, commentaire, type_transaction = 'achat' } = body;

    // Validation
    if (!acteur_id || typeof acteur_id !== 'number') {
      return NextResponse.json({ error: 'acteur_id invalide' }, { status: 400 });
    }
    if (!auteur_nom || auteur_nom.trim().length < 2) {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
    }
    if (!auteur_email || !auteur_email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (!note || note < 1 || note > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 });
    }
    if (!commentaire || commentaire.trim().length < 20) {
      return NextResponse.json({ error: 'Commentaire trop court (min 20 caractères)' }, { status: 400 });
    }

    const validTypes = ['achat', 'vente', 'location', 'estimation', 'autre'];
    const txType = validTypes.includes(type_transaction) ? type_transaction : 'achat';

    await ensureTable();

    // Vérifier que l'acteur existe
    const acteurRows = await sql`SELECT id FROM acteurs WHERE id = ${acteur_id} AND is_active = true LIMIT 1`;
    if (!acteurRows.length) {
      return NextResponse.json({ error: 'Professionnel introuvable' }, { status: 404 });
    }

    // Insérer (avec gestion doublon email)
    try {
      await sql`
        INSERT INTO avis_acteurs (acteur_id, auteur_nom, auteur_email, note, commentaire, type_transaction)
        VALUES (${acteur_id}, ${auteur_nom.trim()}, ${auteur_email.toLowerCase().trim()},
                ${note}, ${commentaire.trim()}, ${txType})
      `;
    } catch (insertErr: unknown) {
      const pgErr = insertErr as { code?: string };
      if (pgErr?.code === '23505') {
        return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour ce professionnel' }, { status: 409 });
      }
      throw insertErr;
    }

    return NextResponse.json({ ok: true, message: 'Avis soumis — il sera publié après modération' });
  } catch (err) {
    console.error('[POST /api/avis]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
