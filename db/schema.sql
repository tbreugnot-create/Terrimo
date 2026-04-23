-- ============================================================
-- TERRIMO — Schéma base de données PostgreSQL (Neon)
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AGENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS agencies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  odoo_partner_id  INTEGER UNIQUE,           -- Lien vers Odoo res.partner
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE,
  commune          VARCHAR(100),
  type             VARCHAR(50) CHECK (type IN ('franchise', 'independant')),
  plan             VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  phone            VARCHAR(50),
  email            VARCHAR(255),
  website          VARCHAR(1000),
  address          TEXT,
  google_rating    DECIMAL(2,1),
  google_reviews   INTEGER DEFAULT 0,
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),
  is_recommended   BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  description      TEXT,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agencies_commune ON agencies(commune);
CREATE INDEX IF NOT EXISTS idx_agencies_plan ON agencies(plan);
CREATE INDEX IF NOT EXISTS idx_agencies_recommended ON agencies(is_recommended);

-- ============================================================
-- BIENS (LISTINGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id        UUID REFERENCES agencies(id) ON DELETE CASCADE,
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  price            DECIMAL(15,2),
  commune          VARCHAR(100),
  type_bien        VARCHAR(50) CHECK (type_bien IN ('maison', 'appartement', 'terrain', 'autre')),
  surface          INTEGER,
  pieces           INTEGER,
  chambres         INTEGER,
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),
  url_externe      VARCHAR(1000),
  photos           TEXT[],
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_agency ON listings(agency_id);
CREATE INDEX IF NOT EXISTS idx_listings_commune ON listings(commune);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active);

-- ============================================================
-- TRANSACTIONS DVF
-- ============================================================
CREATE TABLE IF NOT EXISTS dvf_transactions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_mutation            VARCHAR(50),
  commune                VARCHAR(100) NOT NULL,
  code_commune           VARCHAR(10),
  date_mutation          DATE,
  nature_mutation        VARCHAR(50),
  valeur_fonciere        DECIMAL(15,2),
  surface_reelle_bati    INTEGER,
  nombre_pieces          INTEGER,
  type_local             VARCHAR(50),   -- Maison / Appartement
  prix_m2                DECIMAL(10,2),
  lat                    DECIMAL(10,7),
  lng                    DECIMAL(10,7),
  annee                  SMALLINT,
  created_at             TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dvf_commune ON dvf_transactions(commune);
CREATE INDEX IF NOT EXISTS idx_dvf_type_local ON dvf_transactions(type_local);
CREATE INDEX IF NOT EXISTS idx_dvf_annee ON dvf_transactions(annee);
CREATE INDEX IF NOT EXISTS idx_dvf_date ON dvf_transactions(date_mutation DESC);

-- ============================================================
-- LEADS (contacts depuis la carte)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id        UUID REFERENCES agencies(id),
  name             VARCHAR(255),
  email            VARCHAR(255),
  phone            VARCHAR(50),
  message          TEXT,
  commune          VARCHAR(100),
  source           VARCHAR(50) DEFAULT 'map',  -- map, quartier, business
  odoo_lead_id     INTEGER,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_agency ON leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

-- ============================================================
-- VUE : stats par commune (utilisée par /api/stats/commune)
-- ============================================================
CREATE OR REPLACE VIEW commune_stats AS
SELECT
  commune,
  COUNT(*)                                           AS nb_transactions,
  ROUND(AVG(prix_m2)::numeric, 0)                   AS prix_moyen_m2,
  ROUND(AVG(valeur_fonciere)::numeric, 0)            AS prix_moyen,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP
    (ORDER BY valeur_fonciere)::numeric, 0)          AS prix_median,
  ROUND(AVG(CASE WHEN type_local = 'Maison'
    THEN prix_m2 END)::numeric, 0)                   AS prix_moyen_m2_maison,
  ROUND(AVG(CASE WHEN type_local = 'Appartement'
    THEN prix_m2 END)::numeric, 0)                   AS prix_moyen_m2_appart,
  COUNT(CASE WHEN type_local = 'Maison' THEN 1 END)  AS nb_maisons,
  COUNT(CASE WHEN type_local = 'Appartement' THEN 1 END) AS nb_apparts,
  MAX(date_mutation)                                 AS derniere_transaction,
  MAX(annee)                                         AS derniere_annee
FROM dvf_transactions
WHERE prix_m2 IS NOT NULL
  AND prix_m2 > 500
  AND prix_m2 < 50000
  AND valeur_fonciere > 50000
GROUP BY commune;
