/**
 * TERRIMO — Import acteurs depuis les JSON de l'ancien site
 *
 * Lit les fichiers old-data/*.json et insère dans la table acteurs.
 * Couvre : agences (103) + notaires (19) + diagnostiqueurs (13)
 *
 * Usage : npx tsx db/import-acteurs.ts
 * Prérequis : DATABASE_URL dans .env.local
 */

import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// CHARGEMENT ENV
// ============================================================
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL manquant dans .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ============================================================
// HELPERS
// ============================================================
function readJson(filename: string): unknown[] {
  const p = path.join(process.cwd(), '..', 'old-data', filename);
  if (!fs.existsSync(p)) {
    console.warn(`  ⚠️  Fichier introuvable : ${p}`);
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
  return Array.isArray(raw) ? raw : raw.data ?? raw.agencies ?? raw.notaires ?? [];
}

// ============================================================
// MIGRATION SCHEMA
// ============================================================
async function runMigration(client: ReturnType<typeof pool.connect> extends Promise<infer T> ? T : never) {
  console.log('🔧 Création table acteurs...');
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'db', 'migrate-acteurs.sql'),
    'utf-8'
  );
  await client.query(sql);
  console.log('  ✅ Table acteurs prête\n');
}

// ============================================================
// IMPORT AGENCES (103)
// ============================================================
async function importAgences(client: ReturnType<typeof pool.connect> extends Promise<infer T> ? T : never) {
  const data = readJson('agencies.json') as Array<{
    name: string; slug: string; address: string; commune: string;
    code_postal: string; phone: string; email: string; website: string;
    logo_url: string | null; description: string | null;
    latitude: number; longitude: number;
    google_rating: string | number; google_reviews_count: number;
    listing_count: number; agency_type: string; tier: string;
  }>;

  if (!data.length) return console.warn('  ⚠️  Pas de données agencies');

  console.log(`📥 Import de ${data.length} agences...`);
  let inserted = 0, skipped = 0;

  for (const a of data) {
    try {
      const meta = {
        agency_type: a.agency_type || 'independant',
        listing_count: a.listing_count || 0,
        description: a.description || null,
        tier_old: a.tier || 'free',
        is_recommended: a.tier === 'premium',
      };

      await client.query(`
        INSERT INTO acteurs
          (type, name, slug, plan, phone, email, website, logo_url,
           address, commune, code_postal, lat, lng,
           google_rating, google_reviews, meta)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          google_rating = EXCLUDED.google_rating,
          google_reviews = EXCLUDED.google_reviews,
          meta = EXCLUDED.meta,
          updated_at = NOW()
      `, [
        'agence',
        a.name,
        a.slug,
        a.tier === 'premium' ? 'premium' : 'free',
        a.phone || null,
        a.email || null,
        a.website || null,
        a.logo_url || null,
        a.address || null,
        a.commune || null,
        a.code_postal || null,
        a.latitude || null,
        a.longitude || null,
        a.google_rating ? parseFloat(String(a.google_rating)) : null,
        a.google_reviews_count || 0,
        JSON.stringify(meta),
      ]);
      inserted++;
    } catch {
      skipped++;
    }
  }

  console.log(`  ✅ ${inserted} agences insérées, ${skipped} ignorées\n`);
}

// ============================================================
// IMPORT NOTAIRES (19)
// ============================================================
async function importNotaires(client: ReturnType<typeof pool.connect> extends Promise<infer T> ? T : never) {
  const data = readJson('notaires.json') as Array<{
    slug: string; office_name: string; notaires_names: string[];
    address: string; postal_code: string; city: string;
    latitude: number; longitude: number;
    phone: string; email: string | null; website: string | null;
    google_rating: number; google_reviews_count: number;
    specialties: string[]; hours: string | null; notes: string | null; tier: string;
  }>;

  if (!data.length) return console.warn('  ⚠️  Pas de données notaires');

  console.log(`📥 Import de ${data.length} notaires...`);
  let inserted = 0, skipped = 0;

  for (const n of data) {
    try {
      const meta = {
        office_name: n.office_name,
        notaires_names: n.notaires_names || [],
        specialties: n.specialties || [],
        hours: n.hours || null,
        notes: n.notes || null,
      };

      await client.query(`
        INSERT INTO acteurs
          (type, name, slug, plan, phone, email, website,
           address, commune, code_postal, lat, lng,
           google_rating, google_reviews, meta)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          meta = EXCLUDED.meta,
          updated_at = NOW()
      `, [
        'notaire',
        n.office_name,
        n.slug,
        n.tier === 'premium' ? 'premium' : 'free',
        n.phone || null,
        n.email || null,
        n.website || null,
        n.address || null,
        n.city || null,
        n.postal_code || null,
        n.latitude || null,
        n.longitude || null,
        n.google_rating || null,
        n.google_reviews_count || 0,
        JSON.stringify(meta),
      ]);
      inserted++;
    } catch {
      skipped++;
    }
  }

  console.log(`  ✅ ${inserted} notaires insérés, ${skipped} ignorés\n`);
}

// ============================================================
// IMPORT DIAGNOSTIQUEURS (13)
// ============================================================
async function importDiagnostiqueurs(client: ReturnType<typeof pool.connect> extends Promise<infer T> ? T : never) {
  const data = readJson('diag1.json') as Array<{
    slug: string; name: string; contact_person: string | null;
    address: string; postal_code: string; city: string;
    latitude: number; longitude: number;
    phone: string; email: string | null; website: string | null;
    zone_coverage: string | null; certifications: string | null;
    google_rating: number; google_reviews_count: number;
    services: string[]; hours: string | null; tier: string;
  }>;

  if (!data.length) return console.warn('  ⚠️  Pas de données diagnostiqueurs');

  console.log(`📥 Import de ${data.length} diagnostiqueurs...`);
  let inserted = 0, skipped = 0;

  for (const d of data) {
    try {
      const meta = {
        contact_person: d.contact_person || null,
        zone_coverage: d.zone_coverage || null,
        certifications: d.certifications || null,
        services: d.services || [],
        hours: d.hours || null,
      };

      await client.query(`
        INSERT INTO acteurs
          (type, name, slug, plan, phone, email, website,
           address, commune, code_postal, lat, lng,
           google_rating, google_reviews, meta)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          meta = EXCLUDED.meta,
          updated_at = NOW()
      `, [
        'diagnostiqueur',
        d.name,
        d.slug,
        d.tier === 'premium' ? 'premium' : 'free',
        d.phone || null,
        d.email || null,
        d.website || null,
        d.address || null,
        d.city || null,
        d.postal_code || null,
        d.latitude || null,
        d.longitude || null,
        d.google_rating || null,
        d.google_reviews_count || 0,
        JSON.stringify(meta),
      ]);
      inserted++;
    } catch {
      skipped++;
    }
  }

  console.log(`  ✅ ${inserted} diagnostiqueurs insérés, ${skipped} ignorés\n`);
}

// ============================================================
// AJOUT INDEX UNIQUE SUR SLUG (si pas déjà là)
// ============================================================
async function addUniqueSlug(client: ReturnType<typeof pool.connect> extends Promise<infer T> ? T : never) {
  try {
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_acteurs_slug_unique ON acteurs(slug)
      WHERE slug IS NOT NULL
    `);
  } catch {
    // Index peut-être déjà là
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🏠 TERRIMO — Import acteurs (agences + notaires + diagnostiqueurs)\n');

  const client = await pool.connect();
  try {
    await addUniqueSlug(client);
    await runMigration(client);
    await importAgences(client);
    await importNotaires(client);
    await importDiagnostiqueurs(client);

    // Récapitulatif
    const result = await client.query(`
      SELECT type, COUNT(*) as nb
      FROM acteurs
      WHERE is_active = true
      GROUP BY type
      ORDER BY nb DESC
    `);

    console.log('📊 Récapitulatif final :');
    let total = 0;
    for (const row of result.rows) {
      console.log(`  ${row.type.padEnd(15)} : ${row.nb}`);
      total += parseInt(row.nb);
    }
    console.log(`  ${'TOTAL'.padEnd(15)} : ${total} acteurs`);

  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n✅ Import terminé !');
}

main().catch((err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
