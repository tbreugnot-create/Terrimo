-- TERRIMO — Table analytics événements biens
-- Exécuter via: node db/run-migrate-events.cjs

CREATE TABLE IF NOT EXISTS bien_events (
  id          BIGSERIAL PRIMARY KEY,
  bien_id     INTEGER NOT NULL,
  acteur_id   INTEGER,  -- acteur du bien (dénormalisé pour perf)
  event_type  VARCHAR(30) NOT NULL CHECK (event_type IN ('view', 'contact_click', 'phone_click', 'share', 'soft_gate')),
  ip_hash     VARCHAR(64),   -- sha256 tronqué, jamais l'IP brute (RGPD)
  session_id  VARCHAR(64),   -- uuid côté client (localStorage)
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bien_events_bien_id_idx     ON bien_events (bien_id);
CREATE INDEX IF NOT EXISTS bien_events_acteur_id_idx   ON bien_events (acteur_id);
CREATE INDEX IF NOT EXISTS bien_events_created_at_idx  ON bien_events (created_at DESC);
CREATE INDEX IF NOT EXISTS bien_events_type_idx        ON bien_events (event_type);

-- Vue aggrégée par bien (30 derniers jours)
CREATE OR REPLACE VIEW bien_events_30j AS
SELECT
  bien_id,
  acteur_id,
  COUNT(*) FILTER (WHERE event_type = 'view')          AS views,
  COUNT(*) FILTER (WHERE event_type = 'contact_click') AS contact_clicks,
  COUNT(*) FILTER (WHERE event_type = 'phone_click')   AS phone_clicks,
  COUNT(*) FILTER (WHERE event_type = 'share')         AS shares
FROM bien_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY bien_id, acteur_id;
