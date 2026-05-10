-- ============================================================
-- TERRIMO — Migration : table mandats_recherche
-- ============================================================

CREATE TABLE IF NOT EXISTS mandats_recherche (
  id                  BIGSERIAL PRIMARY KEY,
  token               VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Contact (révélé uniquement aux agences premium)
  email               VARCHAR(255) NOT NULL,
  phone               VARCHAR(20),
  prenom              VARCHAR(100),

  -- Projet
  type_acquisition    VARCHAR(30) CHECK (type_acquisition IN (
                        'residence_principale', 'residence_secondaire',
                        'investissement', 'location_saisonniere'
                      )),
  horizon             VARCHAR(20) CHECK (horizon IN (
                        '1mois', '3mois', '6mois', '1an', 'sans_urgence'
                      )),
  premiere_acquisition BOOLEAN DEFAULT false,

  -- Géographie
  communes            TEXT[]  NOT NULL DEFAULT '{}',
  proximites          TEXT[]  DEFAULT '{}',         -- quartiers/zones supplém.
  accepte_renovation  BOOLEAN DEFAULT true,

  -- Bien recherché
  types_bien          TEXT[]  DEFAULT '{}',
  surface_min         INTEGER,
  surface_max         INTEGER,
  chambres_min        SMALLINT,
  terrain_souhaite    BOOLEAN DEFAULT false,
  terrain_min         INTEGER,                     -- en m²
  caracteristiques    TEXT[]  DEFAULT '{}',        -- 'piscine','vue_mer','garage'…

  -- Budget & financement
  budget_max          INTEGER,
  budget_travaux      INTEGER,
  apport              INTEGER,
  mode_financement    VARCHAR(20) CHECK (mode_financement IN (
                        'comptant', 'credit', 'non_decide'
                      )),
  accord_bancaire     BOOLEAN DEFAULT false,
  sci                 BOOLEAN DEFAULT false,
  eligible_ptz        BOOLEAN DEFAULT false,

  -- Critères supplémentaires
  vente_conditionnee  BOOLEAN DEFAULT false,
  accepte_copropriete BOOLEAN DEFAULT true,
  charges_max         INTEGER,                     -- charges copro max €/mois
  dpe_acceptes        TEXT[]  DEFAULT '{}',        -- ['A','B','C']

  -- Description libre
  description         TEXT,

  -- État & durée
  is_active           BOOLEAN DEFAULT true,
  expires_at          TIMESTAMP DEFAULT NOW() + INTERVAL '6 months',
  notified_at         TIMESTAMP,                   -- date dernier envoi aux agences

  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS mandats_communes_idx     ON mandats_recherche USING gin(communes);
CREATE INDEX IF NOT EXISTS mandats_active_exp_idx   ON mandats_recherche (is_active, expires_at);
CREATE INDEX IF NOT EXISTS mandats_created_idx      ON mandats_recherche (created_at DESC);
CREATE INDEX IF NOT EXISTS mandats_email_idx        ON mandats_recherche (email);
CREATE INDEX IF NOT EXISTS mandats_token_idx        ON mandats_recherche (token);
CREATE INDEX IF NOT EXISTS mandats_financement_idx  ON mandats_recherche (mode_financement, accord_bancaire);
