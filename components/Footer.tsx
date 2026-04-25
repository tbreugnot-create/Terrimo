'use client';

import Link from 'next/link';

const CURRENT_YEAR = new Date().getFullYear();

const PROPRIO = [
  { label: 'Estimer mon bien', href: '/evaluer' },
  { label: 'Je veux vendre', href: '/evaluer?intention=vendre' },
  { label: 'Je veux louer', href: '/evaluer?intention=louer' },
  { label: 'Faire un DPE', href: '/evaluer?intention=diagnostiquer' },
  { label: 'Consulter un notaire', href: '/evaluer?intention=notaire' },
];

const PRO = [
  { label: 'Rejoindre Terrimo', href: '/pro/rejoindre' },
  { label: 'Agences immobilières', href: '/pro/rejoindre?type=agence' },
  { label: 'Conciergeries', href: '/pro/rejoindre?type=conciergerie' },
  { label: 'Diagnostiqueurs', href: '/pro/rejoindre?type=diagnostiqueur' },
  { label: 'Notaires', href: '/pro/rejoindre?type=notaire' },
];

const DECOUVRIR = [
  { label: 'Carte interactive', href: '/' },
  { label: 'Arcachon', href: '/quartier/arcachon' },
  { label: 'La Teste-de-Buch', href: '/quartier/la-teste-de-buch' },
  { label: 'Andernos-les-Bains', href: '/quartier/andernos-les-bains' },
  { label: 'Lège-Cap Ferret', href: '/quartier/lege-cap-ferret' },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#0f1923',
      color: '#b0bec5',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      fontSize: '0.875rem',
      marginTop: 'auto',
    }}>
      {/* Main grid */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '3rem 1.5rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '2.5rem',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>Terrimo</span>
            <span style={{
              fontSize: '0.65rem',
              background: '#1a6b5a',
              color: '#5dffd3',
              borderRadius: 4,
              padding: '2px 6px',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>BASSIN</span>
          </div>
          <p style={{ lineHeight: 1.6, color: '#78909c', maxWidth: 220, marginBottom: 20 }}>
            La carte immobilière du Bassin d&apos;Arcachon. Estimez, trouvez les bons pros, prenez les meilleures décisions.
          </p>
          <a
            href="mailto:contact@terrimo.homes"
            style={{ color: '#5dffd3', textDecoration: 'none', fontSize: '0.8125rem' }}
          >
            contact@terrimo.homes
          </a>
        </div>

        {/* Propriétaires */}
        <div>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: 14, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Propriétaires
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PROPRIO.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} style={{ color: '#b0bec5', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#b0bec5')}
                >{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Professionnels */}
        <div>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: 14, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Professionnels
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRO.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} style={{ color: '#b0bec5', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#b0bec5')}
                >{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Découvrir */}
        <div>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: 14, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Découvrir
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DECOUVRIR.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} style={{ color: '#b0bec5', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#b0bec5')}
                >{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #1e2d3d',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#546e7a',
        fontSize: '0.8rem',
      }}>
        <span>© {CURRENT_YEAR} Terrimo — Tous droits réservés</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/mentions-legales" style={{ color: '#546e7a', textDecoration: 'none' }}>Mentions légales</Link>
          <Link href="/confidentialite" style={{ color: '#546e7a', textDecoration: 'none' }}>Confidentialité</Link>
          <Link href="/pro/rejoindre" style={{ color: '#5dffd3', textDecoration: 'none', fontWeight: 600 }}>Espace Pro</Link>
        </div>
      </div>
    </footer>
  );
}
