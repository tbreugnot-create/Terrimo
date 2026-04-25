'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─── Structure des menus ─────────────────────────────────
const PROPRIO_ITEMS = [
  {
    href: '/evaluer',
    icon: '🏷️',
    label: 'Estimer & vendre',
    desc: 'Fourchette DVF + mise en relation agence',
  },
  {
    href: '/evaluer?intention=louer',
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
    label: 'Estimation notariale',
    desc: 'Succession, donation, vente entre particuliers',
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
];

// ─── Styles inline partagés ──────────────────────────────
const PANEL: React.CSSProperties = {
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

const ITEM_BASE: React.CSSProperties = {
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
  const [openDropdown,  setOpenDropdown]  = useState<'proprio' | 'pro' | null>(null);
  const [scrolled,      setScrolled]      = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

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

  const toggleDropdown = (key: 'proprio' | 'pro') =>
    setOpenDropdown(prev => prev === key ? null : key);

  const linkStyle = (active: boolean): React.CSSProperties => ({
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
                  ...linkStyle(openDropdown === 'proprio' || isActive('/evaluer')),
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

          {/* ── CTA unique ── */}
          <div className="hide-mobile" style={{ flexShrink: 0 }}>
            <Link
              href="/evaluer"
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
              🏡 Estimer gratuitement
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

          {/* Séparateur */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,.08)', margin: '8px 0' }} />

          {/* Accordéon Propriétaires */}
          <MobileSection
            icon="🏠"
            label="Propriétaires"
            items={PROPRIO_ITEMS}
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

          {/* CTA mobile */}
          <Link
            href="/evaluer"
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
            🏡 Estimer mon bien gratuitement
          </Link>
        </div>
      )}

      {/* Spacer pour la nav fixed */}
      <div style={{ height: '68px' }} aria-hidden="true" />
    </>
  );
}
