/**
 * TERRIMO — Stripe singleton
 * Utiliser UNIQUEMENT côté serveur (API routes, webhooks)
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Pas de throw pour éviter de casser le build si la var n'est pas encore configurée
  console.warn('[Stripe] STRIPE_SECRET_KEY manquant — paiements désactivés');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

export default stripe;

// ─── Plans & prix ────────────────────────────────────────────────────────────
export const PLANS = {
  pro_monthly: {
    label: 'Pro Mensuel',
    price: 49,
    interval: 'month' as const,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    plan: 'pro',
  },
  pro_annual: {
    label: 'Pro Annuel',
    price: 490,
    interval: 'year' as const,
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
    plan: 'pro',
    savings: '2 mois offerts',
  },
  premium_monthly: {
    label: 'Premium Mensuel',
    price: 129,
    interval: 'month' as const,
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '',
    plan: 'premium',
  },
  premium_annual: {
    label: 'Premium Annuel',
    price: 1290,
    interval: 'year' as const,
    priceId: process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? '',
    plan: 'premium',
    savings: '2 mois offerts',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
