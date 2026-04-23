import { sql } from '@/lib/db';

interface DvfStatsData {
  commune: string;
  nb_transactions: number;
  prix_moyen_m2: number;
  prix_moyen: number;
  prix_median: number;
  prix_moyen_m2_maison: number | null;
  prix_moyen_m2_appart: number | null;
  nb_maisons: number;
  nb_apparts: number;
  derniere_transaction: string;
  derniere_annee: number;
}

async function getStats(dvfName: string): Promise<DvfStatsData | null> {
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
      WHERE commune = ${dvfName}
        AND prix_m2 IS NOT NULL
        AND prix_m2 > 500
        AND prix_m2 < 50000
        AND valeur_fonciere > 50000
      GROUP BY commune
    `;
    return rows.length > 0 ? (rows[0] as DvfStatsData) : null;
  } catch {
    return null;
  }
}

function formatPrice(n: number | null): string {
  if (!n) return '—';
  return new Intl.NumberFormat('fr-FR').format(n) + ' €';
}

function formatPriceM2(n: number | null): string {
  if (!n) return '—';
  return new Intl.NumberFormat('fr-FR').format(n) + ' €/m²';
}

interface DvfStatsProps {
  dvfName: string;
  communeName: string;
}

export default async function DvfStats({ dvfName, communeName }: DvfStatsProps) {
  const stats = await getStats(dvfName);

  if (!stats || stats.nb_transactions < 5) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
          📊 Données du marché
        </h3>
        <p className="text-sm text-gray-400">Données insuffisantes pour {communeName}</p>
        <p className="text-xs text-gray-300 mt-2">Source : Demandes de Valeurs Foncières (data.gouv.fr)</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 border border-indigo-100">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📊 Données du marché
        <span className="text-xs font-normal text-gray-400">Source DVF</span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Prix moyen m² global */}
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-400 mb-1">Prix moyen /m²</p>
          <p className="text-lg font-bold text-indigo-700">{formatPriceM2(stats.prix_moyen_m2)}</p>
        </div>

        {/* Prix médian */}
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-400 mb-1">Prix médian</p>
          <p className="text-lg font-bold text-gray-800">{formatPrice(stats.prix_median)}</p>
        </div>

        {/* Maisons */}
        {stats.prix_moyen_m2_maison && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">🏠 Maisons /m²</p>
            <p className="text-base font-semibold text-gray-700">{formatPriceM2(stats.prix_moyen_m2_maison)}</p>
            <p className="text-xs text-gray-300">{stats.nb_maisons} ventes</p>
          </div>
        )}

        {/* Appartements */}
        {stats.prix_moyen_m2_appart && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">🏢 Apparts /m²</p>
            <p className="text-base font-semibold text-gray-700">{formatPriceM2(stats.prix_moyen_m2_appart)}</p>
            <p className="text-xs text-gray-300">{stats.nb_apparts} ventes</p>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-lg p-3 border border-gray-100 col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Transactions analysées</p>
              <p className="text-base font-semibold text-gray-700">{stats.nb_transactions} ventes</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Dernière mise à jour</p>
              <p className="text-sm text-gray-500">{stats.derniere_annee}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-3">
        Source : Demandes de Valeurs Foncières — data.gouv.fr
      </p>
    </div>
  );
}
