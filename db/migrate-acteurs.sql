-- ============================================================
-- TERRIMO — Migration : table acteurs générique
-- Remplace / complète la table agencies avec une table multi-types
-- ============================================================

-- Table principale multi-acteurs
CREATE TABLE IF NOT EXISTS acteurs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Type d'acteur
  type             VARCHAR(50) NOT NULL CHECK (
    type IN ('agence', 'notaire', 'diagnostiqueur', 'conciergerie', 'service')
  ),

  -- Identité
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255),

  -- Abonnement Terrimo
  plan             VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),

  -- Contact
  phone            VARCHAR(50),
  email            VARCHAR(255),
  website          VARCHAR(1000),
  logo_url         VARCHAR(1000),

  -- Localisation
  address          TEXT,
  commune          VARCHAR(100),
  code_postal      VARCHAR(10),
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),

  -- Évaluations Google
  google_rating    DECIMAL(2,1),
  google_reviews   INTEGER DEFAULT 0,

  -- Données type-spécifiques (JSON flexible)
  -- agence       : {agency_type, listing_count, description, tier_old}
  -- notaire      : {office_name, notaires_names, specialties, hours, notes}
  -- diagnostiqueur: {contact_person, zone_coverage, certifications, services, hours}
  -- conciergerie : {services, zones, tarifs_indicatifs}
  -- service      : {category, description}
  meta             JSONB DEFAULT '{}',

  -- Flags
  is_active        BOOLEAN DEFAULT true,
  is_verified      BOOLEAN DEFAULT false,

  -- Lien CRM Odoo
  odoo_partner_id  INTEGER,

  -- Timestamps
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_acteurs_type     ON acteurs(type);
CREATE INDEX IF NOT EXISTS idx_acteurs_commune  ON acteurs(commune);
CREATE INDEX IF NOT EXISTS idx_acteurs_plan     ON acteurs(plan);
CREATE INDEX IF NOT EXISTS idx_acteurs_slug     ON acteurs(slug);
CREATE INDEX IF NOT EXISTS idx_acteurs_coords   ON acteurs(lat, lng) WHERE lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_acteurs_meta     ON acteurs USING gin(meta);

-- ============================================================
-- Vue de compatibilité : agencies → acteurs
-- Permet aux anciennes requêtes de continuer à fonctionner
-- pendant la migration progressive
-- ============================================================
CREATE OR REPLACE VIEW agencies_view AS
SELECT
  id,
  name,
  slug,
  commune,
  (meta->>'agency_type')     AS type,
  plan,
  phone,
  email,
  website,
  google_rating,
  google_reviews             AS google_reviews,
  lat,
  lng,
  (meta->>'is_recommended')::boolean AS is_recommended,
  (meta->>'description')     AS description
FROM acteurs
WHERE type = 'agence'
  AND is_active = true;
