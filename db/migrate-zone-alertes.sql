-- ============================================================
-- TERRIMO — Migration : table zone_alertes
-- Alertes email par zone dessinée sur la carte
-- ============================================================

CREATE TABLE IF NOT EXISTS zone_alertes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact
  email            VARCHAR(255) NOT NULL,

  -- Zone géographique (polygone GeoJSON-like : [[lat,lng], ...])
  polygon          JSONB NOT NULL,

  -- Filtres optionnels
  type_annonce     VARCHAR(20) CHECK (type_annonce IN ('vente', 'location', 'location_saisonniere')),
  prix_max         INTEGER,
  surface_min      INTEGER,

  -- État
  is_active        BOOLEAN DEFAULT true,

  -- Matching : on stocke l'id du dernier bien envoyé pour ne pas re-notifier
  last_matched_at  TIMESTAMP,

  -- CRM
  odoo_partner_id  INTEGER,

  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zone_alertes_email    ON zone_alertes(email);
CREATE INDEX IF NOT EXISTS idx_zone_alertes_active   ON zone_alertes(is_active);
CREATE INDEX IF NOT EXISTS idx_zone_alertes_created  ON zone_alertes(created_at DESC);
