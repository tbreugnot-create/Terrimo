-- Migration : système d'avis natifs Terrimo
-- Exécuter sur Neon PostgreSQL

CREATE TABLE IF NOT EXISTS avis_acteurs (
  id              SERIAL PRIMARY KEY,
  acteur_id       INTEGER NOT NULL REFERENCES acteurs(id) ON DELETE CASCADE,
  auteur_nom      VARCHAR(120) NOT NULL,
  auteur_email    VARCHAR(255) NOT NULL,
  note            SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire     TEXT NOT NULL,
  type_transaction VARCHAR(30) DEFAULT 'achat' CHECK (type_transaction IN ('achat','vente','location','estimation','autre')),
  is_approved     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour fetcher rapidement les avis approuvés d'un acteur
CREATE INDEX IF NOT EXISTS idx_avis_acteur_approved
  ON avis_acteurs(acteur_id, is_approved, created_at DESC);

-- Évite les doublons : même email ne peut pas noter deux fois le même acteur
CREATE UNIQUE INDEX IF NOT EXISTS idx_avis_unique_email_acteur
  ON avis_acteurs(acteur_id, auteur_email);
