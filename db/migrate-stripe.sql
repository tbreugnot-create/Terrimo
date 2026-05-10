-- TERRIMO — Colonnes Stripe sur la table acteurs
-- Exécuter via: node db/run-migrate-stripe.cjs

ALTER TABLE acteurs
  ADD COLUMN IF NOT EXISTS stripe_customer_id     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS acteurs_stripe_customer_idx
  ON acteurs (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
