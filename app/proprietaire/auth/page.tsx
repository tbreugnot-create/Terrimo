'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function AuthForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState(
    errorParam === 'google' ? 'La connexion avec Google a échoué. Essayez avec votre email.' :
    errorParam === 'apple'  ? 'La connexion avec Apple a échoué. Essayez avec votre email.' : ''
  );

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur réseau, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,.15)',
    background: 'rgba(255,255,255,.07)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-.03em' }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
            <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: '4px' }}>
              Déposer une annonce
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '20px',
          padding: '32px 28px',
          backdropFilter: 'blur(12px)',
        }}>
          {sent ? (
            /* ── État envoyé ──────────────────────────── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📬</div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
                Lien envoyé !
              </h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9375rem', lineHeight: 1.6, margin: '0 0 20px' }}>
                Vérifiez votre boîte mail — <strong style={{ color: 'white' }}>{email}</strong> — et cliquez sur le lien pour accéder à votre espace.
              </p>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.8rem', margin: '0 0 24px' }}>
                Vérifiez aussi vos spams si vous ne trouvez pas l&apos;email.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', borderRadius: '10px', padding: '10px 20px', fontSize: '.875rem', cursor: 'pointer' }}
              >
                ← Utiliser une autre adresse
              </button>
            </div>
          ) : (
            /* ── Formulaire ───────────────────────────── */
            <>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white', margin: '0 0 6px', textAlign: 'center' }}>
                Connectez-vous ou inscrivez-vous
              </h1>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.875rem', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
                pour déposer votre annonce et que les personnes à la recherche de leur prochain bien puissent la visualiser.
              </p>

              {/* ── OAuth boutons ── */}
              <a
                href="/api/auth/google"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,.2)',
                  background: 'rgba(255,255,255,.06)',
                  color: 'white',
                  fontSize: '.9375rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginBottom: '10px',
                  transition: 'background .15s',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </a>

              <a
                href="/api/auth/apple"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,.2)',
                  background: 'rgba(255,255,255,.06)',
                  color: 'white',
                  fontSize: '.9375rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginBottom: '20px',
                  transition: 'background .15s',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuer avec Apple
              </a>

              {/* ── Séparateur ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '20px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
                <span style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8125rem' }}>ou par email</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
              </div>

              {/* ── Email ── */}
              <form onSubmit={handleEmail}>
                <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: '8px' }}>
                  Votre e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  required
                  style={{ ...inputStyle, marginBottom: error ? '8px' : '16px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(56,189,248,.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                />
                {error && (
                  <p style={{ color: '#f87171', fontSize: '.8125rem', margin: '0 0 14px' }}>⚠️ {error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: loading || !email.trim() ? 'rgba(56,189,248,.3)' : '#38bdf8',
                    color: '#0c1a2e',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Envoi en cours…' : 'Continuer →'}
                </button>
              </form>

              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.25)', textAlign: 'center', marginTop: 18, lineHeight: 1.5 }}>
                En continuant, vous acceptez les{' '}
                <Link href="/confidentialite" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'underline' }}>CGU</Link>
                {' '}de Terrimo.
              </p>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/proprietaire/deposer-annonce" style={{ color: 'rgba(255,255,255,.3)', fontSize: '.8125rem', textDecoration: 'none' }}>
            ← Comment déposer une annonce
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
