/**
 * TERRIMO — POST /api/pro/checkout
 * Crée une Stripe Checkout Session pour l'upgrade de plan
 *
 * Body: { token: string, planKey: PlanKey }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import stripe, { PLANS, PlanKey } from '@/lib/stripe';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';

export async function POST(request: NextRequest) {
  try {
    const { token, planKey } = await request.json() as { token: string; planKey: PlanKey };

    if (!token || !planKey) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const plan = PLANS[planKey];
    if (!plan) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID non configuré pour ce plan' },
        { status: 503 }
      );
    }

    // ── Auth acteur ──────────────────────────────────────────────────────────
    const rows = await sql`
      SELECT id, name, email, plan AS current_plan
      FROM acteurs
      WHERE access_token = ${token} AND is_active = true
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const acteur = rows[0] as { id: number; name: string; email: string; current_plan: string };

    // Ne pas permettre de downgrade via checkout
    const planOrder = ['free', 'pro', 'premium'];
    if (planOrder.indexOf(plan.plan) <= planOrder.indexOf(acteur.current_plan)) {
      return NextResponse.json(
        { error: 'Vous êtes déjà sur un plan supérieur ou équivalent' },
        { status: 400 }
      );
    }

    // ── Créer la Stripe Checkout Session ────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: acteur.email,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      metadata: {
        acteur_id: String(acteur.id),
        plan: plan.plan,
        plan_key: planKey,
        token,
      },
      success_url: `${BASE_URL}/pro/dashboard/${token}?upgraded=1&plan=${plan.plan}`,
      cancel_url:  `${BASE_URL}/pro/upgrade/${token}?cancelled=1`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: 'fr',
      custom_text: {
        submit: {
          message: `Activer le plan ${plan.label} pour ${acteur.name}`,
        },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('/api/pro/checkout error:', error);
    return NextResponse.json({ error: 'Erreur création session Stripe' }, { status: 500 });
  }
}
