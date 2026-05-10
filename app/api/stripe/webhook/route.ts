/**
 * TERRIMO — POST /api/stripe/webhook
 * Reçoit les événements Stripe et met à jour le plan acteur en DB
 *
 * Configurer dans Stripe Dashboard :
 *   endpoint: https://terrimo.homes/api/stripe/webhook
 *   events: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import stripe from '@/lib/stripe';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Stripe exige le body brut pour vérifier la signature
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET manquant');
    return NextResponse.json({ error: 'Configuration serveur' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature invalide:', err);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  // ── Dispatcher ─────────────────────────────────────────────────────────────
  try {
    switch (event.type) {

      // ── Paiement réussi → activer le plan ─────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { acteur_id, plan } = session.metadata ?? {};

        if (!acteur_id || !plan) {
          console.warn('[webhook] metadata manquants sur session', session.id);
          break;
        }

        const stripeCustomerId  = typeof session.customer     === 'string' ? session.customer     : null;
        const stripeSubId       = typeof session.subscription === 'string' ? session.subscription : null;

        await sql`
          UPDATE acteurs
          SET
            plan                 = ${plan},
            stripe_customer_id   = COALESCE(${stripeCustomerId},  stripe_customer_id),
            stripe_subscription_id = COALESCE(${stripeSubId}, stripe_subscription_id),
            updated_at           = NOW()
          WHERE id = ${Number(acteur_id)}
        `;

        console.log(`[webhook] acteur #${acteur_id} passé en plan ${plan}`);
        break;
      }

      // ── Abonnement annulé → repasser en free ──────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;

        if (customerId) {
          await sql`
            UPDATE acteurs
            SET plan = 'free', stripe_subscription_id = NULL, updated_at = NOW()
            WHERE stripe_customer_id = ${customerId}
          `;
          console.log(`[webhook] customer ${customerId} repassé en free (sub supprimé)`);
        }
        break;
      }

      // ── Abonnement mis à jour (upgrade/downgrade Stripe portal) ───────────
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;
        const priceId    = sub.items.data[0]?.price?.id ?? null;
        const status     = sub.status;

        if (!customerId || !priceId) break;

        // Retrouver le plan depuis l'ID de prix
        const { PLANS } = await import('@/lib/stripe');
        const matched = Object.values(PLANS).find(p => p.priceId === priceId);
        const newPlan = matched?.plan ?? null;

        if (newPlan && status === 'active') {
          await sql`
            UPDATE acteurs
            SET plan = ${newPlan}, updated_at = NOW()
            WHERE stripe_customer_id = ${customerId}
          `;
          console.log(`[webhook] customer ${customerId} → plan ${newPlan}`);
        } else if (status === 'canceled' || status === 'unpaid') {
          await sql`
            UPDATE acteurs
            SET plan = 'free', updated_at = NOW()
            WHERE stripe_customer_id = ${customerId}
          `;
        }
        break;
      }

      default:
        // Ignorer les autres events
    }
  } catch (err) {
    console.error('[webhook] Erreur traitement event', event.type, err);
    // On retourne quand même 200 pour éviter que Stripe re-tente indéfiniment
  }

  return NextResponse.json({ received: true });
}
