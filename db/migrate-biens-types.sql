-- TERRIMO — Migration : correction contrainte biens.type_bien
-- Le formulaire envoie des valeurs capitalisées (Maison, Villa…)
-- La contrainte existante n'acceptait que les minuscules + manquait Villa/Studio
-- Exécuter une seule fois dans le Neon SQL Editor

ALTER TABLE biens DROP CONSTRAINT IF EXISTS biens_type_bien_check;

ALTER TABLE biens ADD CONSTRAINT biens_type_bien_check
  CHECK (type_bien IN (
    'Maison', 'Villa', 'Appartement', 'Studio', 'Terrain', 'Autre',
    'maison', 'villa', 'appartement', 'studio', 'terrain', 'autre'
  ));
