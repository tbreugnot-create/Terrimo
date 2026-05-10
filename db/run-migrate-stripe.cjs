/**
 * TERRIMO — Migration Stripe columns
 * Usage: node db/run-migrate-stripe.cjs
 */
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const query = fs.readFileSync(path.join(__dirname, 'migrate-stripe.sql'), 'utf-8');
  console.log('Running migration migrate-stripe.sql...');
  await sql(query);
  console.log('✅ Migration stripe terminée');
}

main().catch(e => { console.error(e); process.exit(1); });
