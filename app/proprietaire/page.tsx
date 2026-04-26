'use client';

import { useRouter } from 'next/navigation';

const INTENTIONS = [
  {
    id: 'vendre',
    icon: '💰',
    title: 'Je veux vendre mon bien',
    desc: 'Estimation gratuite, mise en relation avec les agences de votre secteur, conseils pour maximiser la vente.',
    cta: 'Estimer & vendre',
    href: '/evaluer?intention=vendre',
    color: '#10b981',
    border: 'rgba(16,185,129,.3)',
    bg: 'rgba(16,185,129,.08)',
  },
  {
    id: 'louer',
    icon: '🔑',
    title: 'Je veux louer mon bien',
    desc: 'Évaluation du loyer de marché, mise en relation avec les agences et conciergeries partenaires.',
    cta: 'Évaluer & louer',
    href: '/evaluer?intention=louer',
    color: '#0ea5e9',
    border: 'rgba(14,165,233,.3)',
    bg: 'rgba(14,165,233,.08)',
  },
  {
    id: 'dpe',
    icon: '📋',
    title: 'Je cherche un diagnostiqueur',
    desc: 'DPE, amiante, électricité, plomb — trouvez un diagnostiqueur certifié sur le Bassin d\'Arcachon.',
    cta: 'Trouver un diagnostiqueur',
    href: '/evaluer?intention=diagnostiquer',
    color: '#f59e0b',
    border: 'rgba(245,158,11,.3)',
    bg: 'rgba(245,158,11,.08)',
  },
  {
    id: 'notaire',
    icon: '⚖️',
    title: 'Je cherche un notaire',
    desc: 'Succession, donation, achat, vente — trouvez un notaire du Bassin pour accompagner votre projet.',
    cta: 'Trouver un notaire',
    href: '/evaluer?intention=notaire',
    color: '#8b5cf6',
    border: 'rgba(139,92,246,.3)',
    bg: 'rgba(139,92,246,.08)',
  },
  {
    id: 'estimer',
    icon: '📊',
    title: 'Je veux juste une estimation',
    desc: 'Obtenez gratuitement une fourchette de prix de votre bien basée sur les données DVF officielles.',
    cta: 'Estimation gratuite',
    href: '/evaluer?intention=estimer',
    color: '#64748b',
    border: 'rgba(100,116,139,.3)',
    bg: 'rgba(100,116,139,.08)',
  },
];

export default function ProprietairePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: 'calc(100dvh - 68px)',
      background: 'linear-gradient(160deg, #071625 0%, #0c2340 60%, #0a1e35 100%)',
      padding: 'clamp(40px, 8vh, 80px) 24px 80px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)',
            borderRadius: 100, padding: '5px 16px', marginBottom: 20,
            fontSize: '.8125rem', fontWeight: 600, color: '#34d399', letterSpacing: '.04em',
          }}>
            🏡 VOUS ÊTES PROPRIÉTAIRE
          </div>
          <h1 style={{
            fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
            fontWeight: 800, color: 'white',
            lineHeight: 1.15, letterSpacing: '-0.02em',
            marginBottom: 14,
          }}>
            Que souhaitez-vous faire<br />avec votre bien ?
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '1rem', lineHeight: 1.7 }}>
            Choisissez votre besoin pour être mis en relation<br />
            avec les bons professionnels du Bassin d'Arcachon.
          </p>
        </div>

        {/* Cartes intentions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {INTENTIONS.map(intent => (
            <button
              key={intent.id}
              onClick={() => router.push(intent.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: intent.bg,
                border: `1.5px solid ${intent.border}`,
                borderRadius: 16, padding: '20px 24px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'transform .15s, border-color .15s',
                width: '100%',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                (e.currentTarget as HTMLElement).style.borderColor = intent.color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.borderColor = intent.border;
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `${intent.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.625rem',
              }}>
                {intent.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: 4 }}>
                  {intent.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,.45)', fontSize: '.875rem', lineHeight: 1.5 }}>
                  {intent.desc}
                </div>
              </div>
              <div style={{
                flexShrink: 0, color: intent.color,
                fontWeight: 700, fontSize: '.875rem',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ whiteSpace: 'nowrap' }}>{intent.cta}</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,.2)',
          fontSize: '.8125rem', marginTop: 32, lineHeight: 1.6,
        }}>
          Toutes les démarches commencent par quelques informations sur votre bien.<br />
          Aucun engagement, aucune commission Terrimo.
        </p>
      </div>
    </div>
  );
}
