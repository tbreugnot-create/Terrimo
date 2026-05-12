'use client';

import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavoris } from '@/lib/useFavoris';

// ─── Structure des menus ─────────────────────────────────
const PROPRIO_ITEMS = [
  {
    href: '/vendre',
    icon: '🏷️',
    label: 'Vendre mon bien',
    desc: 'Mise en relation agences + estimation gratuite',
  },
  {
    href: '/evaluer',
    icon: '📊',
    label: 'Estimation gratuite',
    desc: 'Fourchette DVF précise, sans engagement',
  },
  {
    href: '/louer',
    icon: '🔑',
    label: 'Louer / Mettre en gestion',
    desc: 'Conciergeries & gestion locative saisonnière',
  },
  {
    href: '/evaluer?intention=diagnostiquer',
    icon: '🔬',
    label: 'Faire diagnostiquer (DPE)',
    desc: 'Obligatoire avant vente ou location',
  },
  {
    href: '/evaluer?intention=notaire',
    icon: '⚖️',
    label: 'Consulter un notaire',
    desc: 'Succession, donation, estimation officielle',
  },
];

const ACQUEREUR_ITEMS = [
  {
    href: '/acquereur',
    icon: '🔍',
    label: 'Déposer ma recherche',
    desc: 'Les agences vous contactent si un bien correspond',
  },
  {
    href: '/',
    icon: '🗺️',
    label: 'Explorer la carte',
    desc: 'Biens disponibles, prix au m², quartiers',
  },
  {
    href: '/vente',
    icon: '🏠',
    label: 'Biens à vendre',
    desc: 'Maisons & appartements sur le Bassin',
  },
  {
    href: '/location',
    icon: '🌊',
    label: 'Biens en location',
    desc: 'Location annuelle et saisonnière',
  },
  {
    href: '/marche',
    icon: '📊',
    label: 'Prix du marché DVF',
    desc: 'Prix m² officiels par commune, évolution annuelle',
  },
  {
    href: '/off-market',
    icon: '🔒',
    label: 'Biens off-market',
    desc: 'Accédez aux biens avant leur publication publique',
  },
  {
    href: '/investir',
    icon: '📈',
    label: 'Investir sur le Bassin',
    desc: 'Rendements LMNP, fiscalité, opportunités 2025',
  },
];

const PRO_ITEMS = [
  {
    href: '/pro/rejoindre?type=agence',
    icon: '🏢',
    label: 'Agence immobilière',
    desc: 'Publiez votre portefeuille, captez des mandats',
  },
  {
    href: '/pro/rejoindre?type=conciergerie',
    icon: '🏡',
    label: 'Conciergerie',
    desc: 'Trouvez des propriétaires à accompagner',
  },
  {
    href: '/pro/rejoindre?type=diagnostiqueur',
    icon: '🔬',
    label: 'Diagnostiqueur',
    desc: 'Visibilité locale, leads pré-vente qualifiés',
  },
  {
    href: '/pro/rejoindre?type=notaire',
    icon: '⚖️',
    label: 'Notaire',
    desc: 'Succession, transactions, estimation officielle',
  },
  {
    href: '/agences',
    icon: '🏢',
    label: 'Annuaire agences',
    desc: 'Toutes les agences du Bassin avec avis clients',
  },
  {
    href: '/conciergeries',
    icon: '🏡',
    label: 'Annuaire conciergeries',
    desc: 'Conciergeries vérifiées pour la location saisonnière',
  },
  {
    href: '/tarifs',
    icon: '💎',
    label: 'Voir les tarifs',
    desc: 'Free · Pro 49€ · Premium 149€/mois',
  },
];

// ─── Styles inline partagés ──────────────────────────────
const PANEL: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  background: '#0f2035',
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: '16px',
  boxShadow: '0 16px 48px rgba(0,0,0,.55)',
  padding: '8px',
  minWidth: '270px',
  animation: 'dropIn .15s ease both',
};

const ITEM_BASE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderRadius: '10px',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'background .12s',
  width: '100%',
};

// ─── Composant DropdownPanel ─────────────────────────────
function DropdownPanel({
  items,
  onClose,
}: {
  items: typeof PROPRIO_ITEMS;
  onClose: () => void;
}) {
  return (
    <div style={PANEL}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={ITEM_BASE}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
          <div>
            <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'white', lineHeight: 1.25 }}>
              {item.label}
            </div>
            <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', marginTop: '2px', lineHeight: 1.3 }}>
              {item.desc}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Composant MobileSection (accordéon) ────────────────
function MobileSection({
  icon,
  label,
  items,
  onClose,
}: {
  icon: string;
  label: string;
  items: typeof PROPRIO_ITEMS;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: '4px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '14px 16px',
          borderRadius: '12px',
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'white',
          background: open ? 'rgba(255,255,255,.08)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          minHeight: '52px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          {label}
        </span>
        <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && (
        <div style={{ paddingLeft: '12px', paddingBottom: '4px' }}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                marginBottom: '2px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{item.label}</div>
                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', marginTop: '2px', lineHeight: 1.3 }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nav principale ──────────────────────────────────────
export default function Nav() {
  const pathname = usePathname();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [openDropdown,  setOpenDropdown]  = useState<'proprio' | 'pro' | 'acquéreur' | null>(null);
  const [scrolled,      setScrolled]      = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { count: favCount } = useFavoris();

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Ferme tout sur changement de route
  useEffect(() => { setMenuOpen(false); setOpenDropdown(null); }, [pathname]);

  // Ferme dropdown si clic hors du nav
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]);

  const toggleDropdown = (key: 'proprio' | 'pro' | 'acquéreur') =>
    setOpenDropdown(prev => prev === key ? null : key);

  const linkStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '.9375rem',
    fontWeight: active ? 700 : 500,
    color: active ? 'white' : 'rgba(255,255,255,.65)',
    background: active ? 'rgba(255,255,255,.12)' : 'transparent',
    textDecoration: 'none',
    transition: 'all .15s ease',
    minHeight: '44px',
    cursor: 'pointer',
    border: 'none',
  });

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link-hover:hover {
          background: rgba(255,255,255,.08) !important;
          color: white !important;
        }
        .nav-dropdown-btn:hover {
          background: rgba(255,255,255,.08) !important;
          color: white !important;
        }
      `}</style>

      <nav
        ref={navRef}
        className="nav-terrimo"
        style={{
          background: scrolled ? 'rgba(12,26,46,.97)' : 'rgba(12,26,46,.92)',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 9990,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
        aria-label="Navigation principale"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }} aria-label="Terrimo — Accueil">
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-.03em', lineHeight: 1 }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
            <span style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em', marginLeft: '8px' }}>
              Bassin d'Arcachon
            </span>
          </Link>

          {/* ── Desktop links ── */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>

            {/* Carte */}
            <Link
              href="/"
              className="nav-link-hover"
              style={linkStyle(isActive('/'))}
            >
              🗺️ Carte
            </Link>

            {/* Propriétaires dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('proprio')}
                className="nav-dropdown-btn"
                style={{
                  ...linkStyle(openDropdown === 'proprio' || isActive('/evaluer') || isActive('/proprietaire')),
                  gap: '6px',
                }}
              >
                🏠 Propriétaires
                <span style={{
                  fontSize: '.65rem',
                  color: 'rgba(255,255,255,.5)',
                  transition: 'transform .15s',
                  transform: openDropdown === 'proprio' ? 'rotate(180deg)' : 'none',
                  display: 'inline-block',
                  marginLeft: '2px',
                }}>▼</span>
              </button>
              {openDropdown === 'proprio' && (
                <DropdownPanel items={PROPRIO_ITEMS} onClose={() => setOpenDropdown(null)} />
              )}
            </div>

            {/* Acquéreurs dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('acquéreur')}
                className="nav-dropdown-btn"
                style={{
                  ...linkStyle(openDropdown === 'acquéreur' || isActive('/rechercher')),
                  gap: '6px',
                }}
              >
                🔍 Acquéreurs
                <span style={{
                  fontSize: '.65rem',
                  color: 'rgba(255,255,255,.5)',
                  transition: 'transform .15s',
                  transform: openDropdown === 'acquéreur' ? 'rotate(180deg)' : 'none',
                  display: 'inline-block',
                  marginLeft: '2px',
                }}>▼</span>
              </button>
              {openDropdown === 'acquéreur' && (
                <DropdownPanel items={ACQUEREUR_ITEMS} onClose={() => setOpenDropdown(null)} />
              )}
            </div>

            {/* Professionnels dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('pro')}
                className="nav-dropdown-btn"
                style={{
                  ...linkStyle(openDropdown === 'pro' || isActive('/pro')),
                  gap: '6px',
                }}
              >
                🏢 Professionnels
                <span style={{
                  fontSize: '.65rem',
                  color: 'rgba(255,255,255,.5)',
                  transition: 'transform .15s',
                  transform: openDropdown === 'pro' ? 'rotate(180deg)' : 'none',
                  display: 'inline-block',
                  marginLeft: '2px',
                }}>▼</span>
              </button>
              {openDropdown === 'pro' && (
                <DropdownPanel items={PRO_ITEMS} onClose={() => setOpenDropdown(null)} />
              )}
            </div>
          </div>

          {/* ── Favoris desktop ── */}
          <div className="hide-mobile">
            <Link
              href="/favoris"
              className="nav-link-hover"
              style={{
                ...linkStyle(isActive('/favoris')),
                position: 'relative',
                padding: '8px 12px',
              }}
              title="Mes favoris"
            >
              <span style={{ fontSize: '1.1rem' }}>❤️</span>
              {favCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2, right: 2,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '.6rem',
                  fontWeight: 700,
                  minWidth: 16, height: 16,
                  borderRadius: '999px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                  lineHeight: 1,
                }}>
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>
          </div>

          {/* ── CTAs desktop ── */}
          <div className="hide-mobile" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Connexion Pro */}
            <Link
              href="/pro/connexion"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '.9rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,.8)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,.2)',
                textDecoration: 'none',
                transition: 'all .15s ease',
                minHeight: '44px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)';
                (e.currentTarget as HTMLElement).style.color = 'white';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.8)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.2)';
              }}
            >
              Espace Pro
            </Link>
            {/* Rejoindre — pour les nouveaux pros */}
            <Link
              href="/pro/rejoindre"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '.9rem',
                fontWeight: 700,
                color: '#0c1a2e',
                background: 'white',
                textDecoration: 'none',
                transition: 'all .15s ease',
                minHeight: '44px',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#e0f2fe';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'white';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              Rejoindre Pro →
            </Link>
          </div>

          {/* ── Hamburger mobile ── */}
          <button
            className="show-mobile-only"
            onClick={() => { setMenuOpen(o => !o); setOpenDropdown(null); }}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
            }}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Menu mobile ── */}
      {menuOpen && (
        <div
          className="show-mobile-only"
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9988,
            background: '#0c1a2e',
            borderTop: '1px solid rgba(255,255,255,.08)',
            padding: '12px 16px 24px',
            overflowY: 'auto',
            animation: 'fadeInUp .18s ease both',
          }}
        >
          {/* Carte */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              fontSize: '1.0625rem',
              fontWeight: isActive('/') ? 700 : 500,
              color: 'white',
              background: isActive('/') ? 'rgba(255,255,255,.1)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '4px',
              minHeight: '52px',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🗺️</span>
            Carte
          </Link>

          {/* Favoris mobile */}
          <Link
            href="/favoris"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              fontSize: '1.0625rem',
              fontWeight: isActive('/favoris') ? 700 : 500,
              color: 'white',
              background: isActive('/favoris') ? 'rgba(255,255,255,.1)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '4px',
              minHeight: '52px',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.25rem' }}>❤️</span>
              Mes favoris
            </span>
            {favCount > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff',
                fontSize: '.7rem', fontWeight: 700,
                padding: '2px 7px', borderRadius: '999px',
              }}>{favCount}</span>
            )}
          </Link>

          {/* Séparateur */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,.08)', margin: '8px 0' }} />

          {/* Accordéon Propriétaires */}
          <MobileSection
            icon="🏠"
            label="Propriétaires"
            items={PROPRIO_ITEMS}
            onClose={() => setMenuOpen(false)}
          />

          {/* Accordéon Acquéreurs */}
          <MobileSection
            icon="🔍"
            label="Acquéreurs"
            items={ACQUEREUR_ITEMS}
            onClose={() => setMenuOpen(false)}
          />

          {/* Accordéon Professionnels */}
          <MobileSection
            icon="🏢"
            label="Professionnels"
            items={PRO_ITEMS}
            onClose={() => setMenuOpen(false)}
          />

          {/* Séparateur */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,.08)', margin: '12px 0' }} />

          {/* CTAs mobile */}
          <Link
            href="/pro/connexion"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,.85)',
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.15)',
              textDecoration: 'none',
              minHeight: '52px',
              marginBottom: '10px',
            }}
          >
            Espace Pro (connexion)
          </Link>
          <Link
            href="/pro/rejoindre"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: '#0c1a2e',
              background: 'white',
              textDecoration: 'none',
              minHeight: '56px',
            }}
          >
            Rejoindre Pro →
          </Link>
        </div>
      )}

      {/* Spacer pour la nav fixed */}
      <div style={{ height: '68px' }} aria-hidden="true" />
    </>
  );
}
