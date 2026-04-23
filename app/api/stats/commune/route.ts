import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 3600; // cache 1h

export async function GET(request: NextRequest) {
  const commune = request.nextUrl.searchParams.get('commune');

  if (!commune) {
    return NextResponse.json({ error: 'Paramètre commune requis' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT
        commune,
        COUNT(*)::int                                              AS nb_transactions,
        ROUND(AVG(prix_m2)::numeric, 0)::int                      AS prix_moyen_m2,
        ROUND(AVG(valeur_fonciere)::numeric, 0)::int              AS prix_moyen,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP
          (ORDER BY valeur_fonciere)::numeric, 0)::int            AS prix_median,
        ROUND(AVG(CASE WHEN type_local = 'Maison'
          THEN prix_m2 END)::numeric, 0)::int                     AS prix_moyen_m2_maison,
        ROUND(AVG(CASE WHEN type_local = 'Appartement'
          THEN prix_m2 END)::numeric, 0)::int                     AS prix_moyen_m2_appart,
        COUNT(CASE WHEN type_local = 'Maison' THEN 1 END)::int    AS nb_maisons,
        COUNT(CASE WHEN type_local = 'Appartement' THEN 1 END)::int AS nb_apparts,
        MAX(date_mutation)::text                                   AS derniere_transaction,
        MAX(annee)::int                                            AS derniere_annee
      FROM dvf_transactions
      WHERE commune = ${commune.toUpperCase()}
        AND prix_m2 IS NOT NULL
        AND prix_m2 > 500
        AND prix_m2 < 50000
        AND valeur_fonciere > 50000
      GROUP BY commune
    `;

    if (rows.length === 0) {
      return NextResponse.json({ commune, insuffisant: true });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Erreur stats commune:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
