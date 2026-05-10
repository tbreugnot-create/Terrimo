/**
 * TERRIMO — Migration bien_events table + view
 * Usage: node db/run-migrate-events.cjs
 */
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const query = fs.readFileSync(path.join(__dirname, 'migrate-bien-events.sql'), 'utf-8');
  console.log('Running migration migrate-bien-events.sql...');
  await sql(query);
  console.log('✅ Migration bien_events terminée');
}

main().catch(e => { console.error(e); process.exit(1); });
