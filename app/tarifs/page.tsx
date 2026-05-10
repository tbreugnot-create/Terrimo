'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Plans ────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Vitrine',
    price: '0',
    period: 'pour toujours',
    color: '#64748b',
    gradient: 'rgba(100,116,139,.12)',
    border: 'rgba(100,116,139,.25)',
    badge: null,
    cta: 'Créer ma fiche',
    ctaHref: '/pro/rejoindre',
    ctaBg: 'rgba(255,255,255,.08)',
    ctaColor: 'rgba(255,255,255,.8)',
    ctaBorder: 'rgba(255,255,255,.15)',
    features: [
      { ok: true,  text: 'Fiche visible sur la carte Terrimo' },
      { ok: true,  text: 'Profil avec coordonnées & horaires' },
      { ok: true,  text: 'Lien vers votre site web' },
      { ok: true,  text: 'Note Google intégrée' },
      { ok: false, text: 'Mise en avant dans les recherches' },
      { ok: false, text: 'Accès aux profils acquéreurs' },
      { ok: false, text: 'Publication de biens illimitée' },
      { ok: false, text: 'Alertes nouveaux mandats' },
      { ok: false, text: 'Badge "Recommandé Terrimo"' },
      { ok: false, text: 'Support prioritaire' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '49',
    period: 'par mois · sans engagement',
    color: '#6366f1',
    gradient: 'rgba(99,102,241,.12)',
    border: 'rgba(99,102,241,.35)',
    badge: 'LE PLUS POPULAIRE',
    cta: 'Démarrer en Pro',
    ctaHref: '/pro/rejoindre?plan=pro',
    ctaBg: '#6366f1',
    ctaColor: 'white',
    ctaBorder: 'transparent',
    features: [
      { ok: true,  text: 'Fiche visible sur la carte Terrimo' },
      { ok: true,  text: 'Profil avec coordonnées & horaires' },
      { ok: true,  text: 'Lien vers votre site web' },
      { ok: true,  text: 'Note Google intégrée' },
      { ok: true,  text: 'Mise en avant dans les recherches' },
      { ok: true,  text: 'Accès aux profils acquéreurs de votre commune' },
      { ok: true,  text: 'Publication de biens illimitée' },
      { ok: true,  text: 'Alertes nouveaux mandats' },
      { ok: false, text: 'Badge "Recommandé Terrimo"' },
      { ok: false, text: 'Support prioritaire' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '149',
    period: 'par mois · sans engagement',
    color: '#f59e0b',
    gradient: 'rgba(245,158,11,.1)',
    border: 'rgba(245,158,11,.35)',
    badge: null,
    cta: 'Passer en Premium',
    ctaHref: '/pro/rejoindre?plan=premium',
    ctaBg: 'linear-gradient(135deg,#f59e0b,#d97706)',
    ctaColor: 'white',
    ctaBorder: 'transparent',
    features: [
      { ok: true,  text: 'Fiche visible sur la carte Terrimo' },
      { ok: true,  text: 'Profil avec coordonnées & horaires' },
      { ok: true,  text: 'Lien vers votre site web' },
      { ok: true,  text: 'Note Google intégrée' },
      { ok: true,  text: 'Mise en avant dans les recherches' },
      { ok: true,  text: 'Accès aux profils acquéreurs — toutes communes' },
      { ok: true,  text: 'Publication de biens illimitée' },
      { ok: true,  text: 'Alertes nouveaux mandats' },
      { ok: true,  text: 'Badge "Recommandé Terrimo"' },
      { ok: true,  text: 'Support prioritaire & onboarding dédié' },
    ],
  },
];

const FAQS = [
  {
    q: 'Y a-t-il un engagement de durée ?',
    a: 'Non. Les offres Pro et Premium sont mensuelles et résiliables à tout moment, sans frais. Votre fiche reste active en mode Free après résiliation.',
  },
  {
    q: 'Qu\'est-ce que les "profils acquéreurs" ?',
    a: 'Les acquéreurs qui s\'inscrivent sur Terrimo (via les mandats de recherche) sont visibles pour les agences Pro et Premium de leur commune. Vous voyez leur budget, critères et pouvez les contacter en direct.',
  },
  {
    q: 'Comment fonctionne la mise en avant ?',
    a: 'Les fiches Pro apparaissent en premier dans la liste des professionnels de votre commune. Les fiches Premium bénéficient en plus du badge "Recommandé Terrimo" et d\'un placement prioritaire sur la carte.',
  },
  {
    q: 'Quels types de professionnels peuvent s\'inscrire ?',
    a: 'Agences immobilières, notaires, diagnostiqueurs (DPE), conciergeries et services immobiliers. Si vous avez un doute sur votre catégorie, contactez-nous.',
  },
  {
    q: 'Comment est calculée la facturation ?',
    a: 'Le paiement est mensuel, prélevé en début de période. La première période démarre le jour de votre inscription. Pas de frais cachés.',
  },
];

const TYPES = [
  { emoji: '🏢', label: 'Agences' },
  { emoji: '⚖️', label: 'Notaires' },
  { emoji: '🔬', label: 'Diagnostiqueurs' },
  { emoji: '🏖️', label: 'Conciergeries' },
];

// ─── Composant ────────────────────────────────────────────────
export default function TarifsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)', color: 'white' }}>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', textAlign: 'center',
        padding: 'clamp(56px,10vh,100px) 24px clamp(40px,7vh,72px)',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.3)',
          borderRadius: 100, padding: '5px 16px', marginBottom: 28,
          fontSize: '.8125rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '.06em',
        }}>
          OFFRES PROFESSIONNELLES
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: 900,
          letterSpacing: '-0.03em', lineHeight: 1.08,
          maxWidth: 680, margin: '0 auto 20px',
        }}>
          Rejoignez la carte immobilière
          <br />
          <span style={{
            background: 'linear-gradient(90deg,#818cf8,#6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>du Bassin d&apos;Arcachon</span>
        </h1>

        <p style={{
          fontSize: 'clamp(.9375rem,2vw,1.0625rem)',
          color: 'rgba(255,255,255,.5)', lineHeight: 1.7,
          maxWidth: 500, margin: '0 auto 20px',
        }}>
          135+ professionnels locaux déjà présents. Soyez visible auprès des acquéreurs qui cherchent activement dans votre commune.
        </p>

        {/* Types acceptés */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {TYPES.map(t => (
            <span key={t.label} style={{
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 100, padding: '5px 14px', fontSize: '.8125rem',
              color: 'rgba(255,255,255,.6)', fontWeight: 600,
            }}>
              {t.emoji} {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Plans ── */}
      <section style={{ padding: '0 20px 72px' }}>
        <div style={{
          maxWidth: 1060, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 16, alignItems: 'start',
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.gradient,
              border: `1.5px solid ${plan.border}`,
              borderRadius: 22, padding: '28px 26px',
              position: 'relative',
              boxShadow: plan.id === 'pro' ? `0 0 60px ${plan.color}20` : 'none',
              transition: 'transform .15s',
            }}>
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: 'white',
                  fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.08em',
                  padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'white', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>
                    {plan.price === '0' ? 'Gratuit' : `${plan.price} €`}
                  </span>
                  {plan.price !== '0' && (
                    <span style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)' }}>/ mois</span>
                  )}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', marginTop: 4 }}>{plan.period}</div>
              </div>

              {/* CTA */}
              <Link href={plan.ctaHref} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                padding: '12px 20px', borderRadius: 12, marginBottom: 24,
                fontWeight: 800, fontSize: '.9375rem',
                background: plan.ctaBg, color: plan.ctaColor,
                border: `1.5px solid ${plan.ctaBorder}`,
                transition: 'opacity .15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                {plan.cta}
              </Link>

              {/* Séparateur */}
              <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 20 }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    fontSize: '.875rem',
                    color: f.ok ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.25)',
                  }}>
                    <span style={{
                      flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.6875rem', fontWeight: 800, marginTop: 1,
                      background: f.ok ? `${plan.color}30` : 'rgba(255,255,255,.05)',
                      color: f.ok ? plan.color : 'rgba(255,255,255,.2)',
                    }}>
                      {f.ok ? '✓' : '✕'}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Note sous les plans */}
        <p style={{
          textAlign: 'center', marginTop: 24,
          fontSize: '.8125rem', color: 'rgba(255,255,255,.3)',
        }}>
          Tous les prix HT · TVA 20% · Paiement par CB ou virement · Facturation mensuelle
        </p>
      </section>

      {/* ── Social proof bande ── */}
      <section style={{ padding: '0 24px 72px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,.025)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 20, padding: '32px 36px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '24px 32px',
          }}>
            {[
              { n: '135+', label: 'professionnels inscrits' },
              { n: '12',   label: 'communes couvertes' },
              { n: '100%', label: 'local Bassin d\'Arcachon' },
              { n: '<48h', label: 'délai de validation fiche' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{s.n}</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', marginTop: 4, letterSpacing: '.04em' }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontWeight: 800,
            fontSize: 'clamp(1.25rem,3vw,1.75rem)',
            letterSpacing: '-0.02em', marginBottom: 40,
          }}>
            Questions fréquentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                background: openFaq === i ? 'rgba(255,255,255,.04)' : 'transparent',
                border: '1px solid',
                borderColor: openFaq === i ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.06)',
                borderRadius: 14, overflow: 'hidden',
                transition: 'all .15s',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '18px 20px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    color: 'white', fontWeight: 600, fontSize: '.9375rem', minHeight: 'auto',
                  }}
                >
                  {faq.q}
                  <span style={{
                    flexShrink: 0, fontSize: '.875rem', color: 'rgba(255,255,255,.4)',
                    transform: openFaq === i ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s', display: 'inline-block',
                  }}>▾</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', fontSize: '.9rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 680, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(99,102,241,.04))',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 24, padding: 'clamp(36px,6vw,56px) 32px',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.25rem,3vw,1.75rem)', marginBottom: 14, letterSpacing: '-.02em' }}>
            Prêt à rejoindre Terrimo ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.9375rem', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
            Votre fiche est créée en 5 minutes. Commencez gratuitement, passez en Pro quand vous le souhaitez.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pro/rejoindre?plan=pro" style={{
              padding: '13px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              color: 'white', fontWeight: 800, fontSize: '.9375rem',
              textDecoration: 'none', boxShadow: '0 8px 28px rgba(99,102,241,.4)',
            }}>
              Démarrer en Pro — 49 €/mois
            </Link>
            <Link href="/pro/rejoindre" style={{
              padding: '13px 24px', borderRadius: 12,
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.75)', fontWeight: 600, fontSize: '.9375rem',
              textDecoration: 'none',
            }}>
              Commencer gratuitement
            </Link>
          </div>
          <p style={{ marginTop: 20, fontSize: '.8125rem', color: 'rgba(255,255,255,.25)' }}>
            Des questions ? <a href="mailto:pro@terrimo.homes" style={{ color: '#818cf8', textDecoration: 'none' }}>pro@terrimo.homes</a>
          </p>
        </div>
      </section>
    </main>
  );
}
