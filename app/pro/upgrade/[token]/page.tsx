'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type PlanKey = 'pro_monthly' | 'pro_annual' | 'premium_monthly' | 'premium_annual';

interface ActeurInfo {
  name: string;
  plan: string;
  commune: string;
}

const PLANS = [
  {
    key: 'pro_monthly' as PlanKey,
    tier: 'pro',
    label: 'Pro',
    billing: 'Mensuel',
    price: 49,
    priceLabel: '49 €/mois',
    savingsLabel: null,
    color: 'indigo',
    features: [
      '5 biens publiables',
      'Mise en avant standard',
      'Analytics 30j (vues, contacts)',
      'Leads de votre commune',
      'Badge vérifié',
      'Page agence publique',
      'Email de bienvenue personnalisé',
    ],
  },
  {
    key: 'pro_annual' as PlanKey,
    tier: 'pro',
    label: 'Pro',
    billing: 'Annuel',
    price: 490,
    priceLabel: '490 €/an',
    savingsLabel: '2 mois offerts',
    color: 'indigo',
    features: [
      '5 biens publiables',
      'Mise en avant standard',
      'Analytics 30j (vues, contacts)',
      'Leads de votre commune',
      'Badge vérifié',
      'Page agence publique',
      'Email de bienvenue personnalisé',
    ],
  },
  {
    key: 'premium_monthly' as PlanKey,
    tier: 'premium',
    label: 'Premium',
    billing: 'Mensuel',
    price: 129,
    priceLabel: '129 €/mois',
    savingsLabel: null,
    color: 'amber',
    popular: true,
    features: [
      'Biens illimités',
      'Mise en avant prioritaire (Featured)',
      'Analytics complets + par type de bien',
      'Leads commune + zones adjacentes',
      'Mandats de recherche acquéreurs',
      'Alertes zone personnalisées',
      'Badge premium doré',
      'Import CSV biens en masse',
      'Support prioritaire',
    ],
  },
  {
    key: 'premium_annual' as PlanKey,
    tier: 'premium',
    label: 'Premium',
    billing: 'Annuel',
    price: 1290,
    priceLabel: '1 290 €/an',
    savingsLabel: '2 mois offerts',
    color: 'amber',
    popular: true,
    features: [
      'Biens illimités',
      'Mise en avant prioritaire (Featured)',
      'Analytics complets + par type de bien',
      'Leads commune + zones adjacentes',
      'Mandats de recherche acquéreurs',
      'Alertes zone personnalisées',
      'Badge premium doré',
      'Import CSV biens en masse',
      'Support prioritaire',
    ],
  },
];

export default function UpgradePage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled') === '1';

  const [acteur, setActeur] = useState<ActeurInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    fetch(`/api/pro/stats?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) setActeur({ name: '', plan: d.plan, commune: d.commune });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleUpgrade(planKey: PlanKey) {
    setCheckingOut(planKey);
    setError(null);
    try {
      const res = await fetch('/api/pro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Erreur lors de la création du paiement');
        setCheckingOut(null);
      }
    } catch {
      setError('Erreur réseau, réessayez.');
      setCheckingOut(null);
    }
  }

  const visiblePlans = PLANS.filter(p =>
    billing === 'monthly' ? p.billing === 'Mensuel' : p.billing === 'Annuel'
  );

  const currentPlan = acteur?.plan ?? 'free';
  const planOrder   = ['free', 'pro', 'premium'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href={`/pro/dashboard/${token}`} style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontSize: 14 }}>
          ← Dashboard
        </a>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>Changer de plan</span>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px',
            background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)',
            borderRadius: 20, fontSize: 12, color: '#a5b4fc', marginBottom: 16,
          }}>
            Plan actuel : <strong style={{ textTransform: 'uppercase' }}>{currentPlan}</strong>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            Passez au niveau supérieur
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, maxWidth: 480, margin: '0 auto 28px' }}>
            Accédez aux leads acquéreurs, analytics avancés et mise en avant prioritaire sur le Bassin d&apos;Arcachon.
          </p>

          {/* Toggle mensuel / annuel */}
          <div style={{
            display: 'inline-flex', background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 4,
          }}>
            {(['monthly', 'annual'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, transition: 'all .2s',
                  background: billing === b ? 'rgba(255,255,255,.12)' : 'transparent',
                  color: billing === b ? '#fff' : 'rgba(255,255,255,.5)',
                }}
              >
                {b === 'monthly' ? 'Mensuel' : 'Annuel'}{b === 'annual' ? ' 🎁' : ''}
              </button>
            ))}
          </div>
          {billing === 'annual' && (
            <div style={{ fontSize: 12, color: '#86efac', marginTop: 8 }}>
              ✓ 2 mois offerts avec l&apos;abonnement annuel
            </div>
          )}
        </div>

        {/* Cancelled notice */}
        {cancelled && (
          <div style={{
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 12, padding: '12px 20px', marginBottom: 24, textAlign: 'center',
            color: '#fca5a5', fontSize: 14,
          }}>
            Paiement annulé. Vous pouvez réessayer ci-dessous.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 12, padding: '12px 20px', marginBottom: 24, textAlign: 'center',
            color: '#fca5a5', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {visiblePlans.map(plan => {
            const isPro     = plan.tier === 'pro';
            const isAbove   = planOrder.indexOf(plan.tier) > planOrder.indexOf(currentPlan);
            const isCurrent = plan.tier === currentPlan;
            const isChecking = checkingOut === plan.key;

            const accent = isPro
              ? { bg: 'rgba(99,102,241,.08)', border: 'rgba(99,102,241,.25)', btn: '#6366f1', btnHover: '#4f46e5', badge: '#a5b4fc', badgeBg: 'rgba(99,102,241,.15)' }
              : { bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.35)', btn: '#f59e0b', btnHover: '#d97706', badge: '#fcd34d', badgeBg: 'rgba(245,158,11,.15)' };

            return (
              <div key={plan.key} style={{
                background: accent.bg,
                border: `1px solid ${plan.popular ? accent.border.replace('.35)', '.6)').replace('.25)', '.5)') : accent.border}`,
                borderRadius: 20, padding: 28, position: 'relative',
                boxShadow: plan.popular ? `0 0 40px ${accent.btn}22` : 'none',
              }}>
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: accent.btn, color: '#fff', fontSize: 11, fontWeight: 700,
                    padding: '3px 14px', borderRadius: 20, letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    ⭐ LE PLUS POPULAIRE
                  </div>
                )}

                {/* Plan header */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: accent.badge, background: accent.badgeBg, padding: '2px 10px', borderRadius: 20,
                    }}>
                      {plan.label}
                    </span>
                    {plan.savingsLabel && (
                      <span style={{
                        fontSize: 11, color: '#86efac', background: 'rgba(134,239,172,.12)',
                        padding: '2px 8px', borderRadius: 20,
                      }}>
                        {plan.savingsLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800 }}>{plan.priceLabel}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
                    {plan.billing === 'Annuel' ? 'facturé annuellement' : 'facturé chaque mois'}
                  </div>
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'rgba(255,255,255,.8)' }}>
                      <span style={{ color: '#86efac', flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div style={{
                    textAlign: 'center', padding: '12px 0', borderRadius: 12,
                    background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.4)', fontSize: 14,
                  }}>
                    Plan actuel
                  </div>
                ) : isAbove ? (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={!!checkingOut || loading}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                      background: isChecking ? 'rgba(255,255,255,.1)' : accent.btn,
                      color: '#fff', fontSize: 15, fontWeight: 700, cursor: isChecking ? 'wait' : 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    {isChecking ? '⏳ Redirection Stripe…' : `Passer en ${plan.label} →`}
                  </button>
                ) : (
                  <div style={{
                    textAlign: 'center', padding: '12px 0', borderRadius: 12,
                    background: 'rgba(255,255,255,.03)', color: 'rgba(255,255,255,.25)', fontSize: 14,
                  }}>
                    Plan inférieur
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Free plan reminder */}
        <div style={{
          marginTop: 24, padding: '20px 24px',
          background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Gratuit (actuel)</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
              1 bien · Pas d&apos;analytics · Pas de leads
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,.3)' }}>0 €</div>
        </div>

        {/* Trust signals */}
        <div style={{
          marginTop: 32, display: 'flex', justifyContent: 'center', gap: 32,
          color: 'rgba(255,255,255,.4)', fontSize: 13,
        }}>
          <span>🔒 Paiement sécurisé Stripe</span>
          <span>📋 Facture TVA disponible</span>
          <span>❌ Résiliation à tout moment</span>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,.4)' }}>
            Chargement…
          </div>
        )}
      </div>
    </div>
  );
}
