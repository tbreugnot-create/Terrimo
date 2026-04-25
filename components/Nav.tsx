'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Ferme le menu sur changement de route
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: '/',             label: 'Carte',         icon: '🗺️' },
    { href: '/evaluer',      label: 'Estimer mon bien', icon: '🏡' },
    { href: '/pro/rejoindre',label: 'Espace Pro',    icon: '🏢' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className="nav-terrimo"
        style={{
          background: scrolled
            ? 'rgba(12,26,46,.97)'
            : 'rgba(12,26,46,.92)',
        }}
        aria-label="Navigation principale"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ textDecoration: 'none' }}
            aria-label="Terrimo — Accueil"
          >
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-.03em',
              lineHeight: 1,
            }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
            <span style={{
              fontSize: '.65rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,.45)',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              lineHeight: 1,
              marginTop: '2px',
            }}>
              Bassin d'Arcachon
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '.9375rem',
                  fontWeight: isActive(l.href) ? 700 : 500,
                  color: isActive(l.href) ? 'white' : 'rgba(255,255,255,.65)',
                  background: isActive(l.href) ? 'rgba(255,255,255,.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all .15s ease',
                  minHeight: '44px',
                }}
                onMouseEnter={e => {
                  if (!isActive(l.href)) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(l.href)) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.65)';
                  }
                }}
              >
                <span aria-hidden="true">{l.icon}</span>
                {l.label}
              </Link>
            ))}

            <Link
              href="/evaluer"
              style={{
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '.9375rem',
                fontWeight: 700,
                color: '#0c1a2e',
                background: 'white',
                textDecoration: 'none',
                transition: 'all .15s ease',
                minHeight: '44px',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#f0f9ff';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'white';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              🏡 Estimer mon bien
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            className="show-mobile-only"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              width: '44px',
              height: '44px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {open ? (
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

      {/* Menu mobile déroulant */}
      {open && (
        <div
          className="show-mobile-only"
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            zIndex: 9998,
            background: '#0c1a2e',
            borderBottom: '1px solid rgba(255,255,255,.1)',
            padding: '16px',
            animation: 'fadeInUp .2s ease both',
          }}
        >
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                fontSize: '1.0625rem',
                fontWeight: isActive(l.href) ? 700 : 500,
                color: 'white',
                background: isActive(l.href) ? 'rgba(255,255,255,.12)' : 'transparent',
                textDecoration: 'none',
                marginBottom: '4px',
                minHeight: '52px',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <Link
            href="/evaluer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
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

      {/* Spacer pour compenser la nav fixed */}
      <div style={{ height: '68px' }} aria-hidden="true" />
    </>
  );
}
