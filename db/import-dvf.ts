/**
 * TERRIMO — Import DVF (Demandes de Valeurs Foncières)
 *
 * Ce script télécharge les données DVF depuis data.gouv.fr,
 * filtre sur les communes du Bassin d'Arcachon (département 33),
 * et les insère dans la table dvf_transactions.
 *
 * Usage : npx tsx db/import-dvf.ts
 * Prérequis : DATABASE_URL dans .env.local
 */

import { neon, Pool } from '@neondatabase/serverless';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as zlib from 'zlib';

// Communes DVF du Bassin d'Arcachon (codes INSEE)
const CODES_COMMUNES_BASSIN = new Set([
  '33009',  // Arcachon
  '33529',  // La Teste-de-Buch
  '33281',  // Lège-Cap-Ferret
  '33005',  // Andernos-les-Bains
  '33021',  // Arès
  '33228',  // Gujan-Mestras
  '33227',  // Lanton
  '33056',  // Biganos
  '33021',  // Audenge
  '33529',  // Le Teich
]);

const NOMS_COMMUNES_BASSIN = new Set([
  'ARCACHON',
  'LA TESTE-DE-BUCH',
  'LEGE-CAP-FERRET',
  'ANDERNOS-LES-BAINS',
  'ARES',
  'GUJAN-MESTRAS',
  'LANTON',
  'BIGANOS',
  'AUDENGE',
  'LE TEICH',
]);

// URLs DVF par année (Gironde = département 33)
const DVF_URLS: Record<string, string> = {
  '2024': 'https://files.data.gouv.fr/geo-dvf/latest/csv/2024/departements/33.csv.gz',
  '2023': 'https://files.data.gouv.fr/geo-dvf/latest/csv/2023/departements/33.csv.gz',
  '2022': 'https://files.data.gouv.fr/geo-dvf/latest/csv/2022/departements/33.csv.gz',
  '2021': 'https://files.data.gouv.fr/geo-dvf/latest/csv/2021/departements/33.csv.gz',
  '2020': 'https://files.data.gouv.fr/geo-dvf/latest/csv/2020/departements/33.csv.gz',
};

interface DVFRow {
  id_mutation: string;
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: string;
  adresse_commune: string;
  code_commune: string;
  surface_reelle_bati: string;
  nombre_pieces_principales: string;
  type_local: string;
  longitude: string;
  latitude: string;
}

function parsePrixM2(valeur: string, surface: string): number | null {
  const v = parseFloat(valeur.replace(',', '.'));
  const s = parseFloat(surface);
  if (!v || !s || s <= 0) return null;
  return Math.round(v / s);
}

async function downloadAndParse(url: string, annee: string): Promise<DVFRow[]> {
  console.log(`📥 Téléchargement DVF ${annee}...`);

  return new Promise((resolve, reject) => {
    const rows: DVFRow[] = [];

    https.get(url, (response) => {
      const gunzip = zlib.createGunzip();
      const stream = response.pipe(gunzip);

      const rl = readline.createInterface({ input: stream });
      let headers: string[] = [];
      let lineCount = 0;

      rl.on('line', (line) => {
        lineCount++;
        const cols = line.split(',');

        if (lineCount === 1) {
          headers = cols;
          return;
        }

        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h.trim()] = (cols[i] || '').trim(); });

        // Filtrer sur les communes du bassin
        const commune = (row['nom_commune'] || '').toUpperCase().trim();
        if (!NOMS_COMMUNES_BASSIN.has(commune)) return;

        // Seulement ventes de biens bâtis
        if (!['Vente', 'Vente en l\'état futur d\'achèvement'].includes(row['nature_mutation'])) return;
        if (!['Maison', 'Appartement'].includes(row['type_local'])) return;
        if (!row['valeur_fonciere'] || !row['surface_reelle_bati']) return;

        rows.push({
          id_mutation: row['id_mutation'] || '',
          date_mutation: row['date_mutation'] || '',
          nature_mutation: row['nature_mutation'] || '',
          valeur_fonciere: row['valeur_fonciere'] || '',
          adresse_commune: commune,
          code_commune: row['code_commune'] || '',
          surface_reelle_bati: row['surface_reelle_bati'] || '',
          nombre_pieces_principales: row['nombre_pieces_principales'] || '',
          type_local: row['type_local'] || '',
          longitude: row['longitude'] || '',
          latitude: row['latitude'] || '',
        });
      });

      rl.on('close', () => {
        console.log(`  ✅ ${rows.length} transactions Bassin trouvées pour ${annee}`);
        resolve(rows);
      });

      rl.on('error', reject);
    }).on('error', reject);
  });
}

async function insertBatch(pool: Pool, rows: DVFRow[], annee: string) {
  if (rows.length === 0) return;

  const BATCH_SIZE = 200;
  let inserted = 0;
  const client = await pool.connect();

  try {
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const params: (string | number | null)[] = [];
      const valuePlaceholders = batch.map((r, idx) => {
        const base = idx * 13;
        const prixM2 = parsePrixM2(r.valeur_fonciere, r.surface_reelle_bati);
        const lat = parseFloat(r.latitude) || null;
        const lng = parseFloat(r.longitude) || null;
        const valeur = parseFloat(r.valeur_fonciere.replace(',', '.')) || null;
        const surface = parseInt(r.surface_reelle_bati) || null;
        const pieces = parseInt(r.nombre_pieces_principales) || null;

        params.push(
          r.id_mutation, r.adresse_commune, r.code_commune, r.date_mutation,
          r.nature_mutation, valeur, surface, pieces, r.type_local,
          prixM2, lat, lng, parseInt(annee)
        );

        return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11},$${base+12},$${base+13})`;
      });

      await client.query(
        `INSERT INTO dvf_transactions
          (id_mutation, commune, code_commune, date_mutation, nature_mutation,
           valeur_fonciere, surface_reelle_bati, nombre_pieces, type_local,
           prix_m2, lat, lng, annee)
         VALUES ${valuePlaceholders.join(',')}
         ON CONFLICT DO NOTHING`,
        params
      );

      inserted += batch.length;
      process.stdout.write(`\r  💾 ${inserted}/${rows.length} insérées...`);
    }
  } finally {
    client.release();
  }

  console.log(`\n  ✅ ${inserted} transactions insérées pour ${annee}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant dans .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('🏠 TERRIMO — Import DVF Bassin d\'Arcachon\n');

  let total = 0;

  for (const [annee, url] of Object.entries(DVF_URLS)) {
    try {
      const rows = await downloadAndParse(url, annee);
      await insertBatch(pool, rows, annee);
      total += rows.length;
    } catch (err) {
      console.error(`⚠️  Erreur pour ${annee}:`, err);
    }
  }

  console.log(`\n🎉 Import terminé ! ${total} transactions au total`);

  // Vérification
  const client = await pool.connect();
  const result = await client.query('SELECT commune, COUNT(*) as nb FROM dvf_transactions GROUP BY commune ORDER BY nb DESC');
  client.release();
  console.log('\n📊 Récapitulatif par commune :');
  result.rows.forEach((row: { commune: string; nb: string }) => {
    console.log(`  ${row.commune}: ${row.nb} transactions`);
  });
  await pool.end();
}

main().catch(console.error);
