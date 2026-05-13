-- TERRIMO — Migration : support type 'particulier' + colonne access_token
-- Exécuter une seule fois pour débloquer l'auth Google/Apple/magic-link

-- 1. Élargir la contrainte CHECK sur acteurs.type pour inclure 'particulier' et 'mandataire'
ALTER TABLE acteurs DROP CONSTRAINT IF EXISTS acteurs_type_check;
ALTER TABLE acteurs ADD CONSTRAINT acteurs_type_check
  CHECK (type IN ('agence', 'notaire', 'diagnostiqueur', 'conciergerie', 'service', 'particulier', 'mandataire'));

-- 2. Ajouter la colonne access_token (token personnel d'accès au dashboard)
ALTER TABLE acteurs
  ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();

-- Backfill pour les lignes existantes qui n'auraient pas de token
UPDATE acteurs SET access_token = gen_random_uuid() WHERE access_token IS NULL;
