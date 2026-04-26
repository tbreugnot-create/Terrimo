import { sql } from '../lib/db';

async function migrate() {
  console.log('Creating mandats_recherche table...');

  await sql`
    CREATE TABLE IF NOT EXISTS mandats_recherche (
      id              SERIAL PRIMARY KEY,
      token           TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,

      -- Contact
      prenom          TEXT,
      email           TEXT NOT NULL,
      phone           TEXT,

      -- Projet
      type_acquisition TEXT,   -- résidence_principale | résidence_secondaire | investissement
      horizon          TEXT,   -- immediat | 3mois | 6mois | 1an
      premiere_acquisition BOOLEAN DEFAULT false,

      -- Localisation
      communes        TEXT[],   -- slugs des communes
      proximites      TEXT[],   -- plage | centre | foret | bassin | ecoles
      accepte_renovation BOOLEAN DEFAULT true,

      -- Bien
      types_bien      TEXT[],  -- maison | appartement | terrain | neuf
      surface_min     INTEGER,
      surface_max     INTEGER,
      chambres_min    INTEGER,
      terrain_souhaite BOOLEAN DEFAULT false,
      terrain_min     INTEGER,
      caracteristiques TEXT[], -- piscine | garage | vue_bassin | acces_plage | plain_pied

      -- Budget
      budget_max      INTEGER,
      budget_travaux  INTEGER,
      apport          INTEGER,

      -- Financement
      mode_financement TEXT,   -- comptant | credit | mixte
      accord_bancaire  BOOLEAN DEFAULT false,
      sci              BOOLEAN DEFAULT false,
      eligible_ptz     BOOLEAN DEFAULT false,

      -- Conditions
      vente_conditionnee   BOOLEAN DEFAULT false,
      accepte_copropriete  BOOLEAN DEFAULT true,
      charges_max          INTEGER,
      dpe_acceptes         TEXT[],  -- A B C D E F G

      -- Texte libre
      description     TEXT,

      -- Meta
      is_active       BOOLEAN DEFAULT true,
      notified_at     TIMESTAMP,
      created_at      TIMESTAMP DEFAULT NOW(),
      expires_at      TIMESTAMP DEFAULT (NOW() + INTERVAL '3 months')
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_mandats_communes ON mandats_recherche USING GIN(communes)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mandats_active ON mandats_recherche(is_active, expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mandats_email ON mandats_recherche(email)`;

  console.log('✅ mandats_recherche table created');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
