'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ConnexionPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pro/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Erreur, veuillez réessayer.');
      }
    } catch {
      setError('Erreur réseau, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-.03em' }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
            <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: '4px' }}>
              Espace professionnel
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '20px',
          padding: '36px 32px',
          backdropFilter: 'blur(12px)',
        }}>
          {!sent ? (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '0 0 8px', textAlign: 'center' }}>
                Connexion
              </h1>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9375rem', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.5 }}>
                Entrez votre email professionnel — nous vous envoyons un lien de connexion instantané.
              </p>

              <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: '8px' }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agence@exemple.fr"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.15)',
                    background: 'rgba(255,255,255,.07)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: error ? '8px' : '20px',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(56,189,248,.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                />

                {error && (
                  <p style={{ color: '#f87171', fontSize: '.875rem', margin: '0 0 16px', lineHeight: 1.4 }}>
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '12px',
                    border: 'none',
                    background: loading || !email.trim() ? 'rgba(56,189,248,.3)' : '#38bdf8',
                    color: '#0c1a2e',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {loading ? 'Envoi en cours…' : 'Recevoir mon lien de connexion →'}
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8125rem', margin: '0 0 8px' }}>
                  Pas encore inscrit ?
                </p>
                <Link href="/pro/rejoindre" style={{ color: '#38bdf8', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}>
                  Créer un compte professionnel →
                </Link>
              </div>
            </>
          ) : (
            /* État succès */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📬</div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white', margin: '0 0 12px' }}>
                Lien envoyé !
              </h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9375rem', lineHeight: 1.6, margin: '0 0 24px' }}>
                Si l&apos;adresse <strong style={{ color: 'white' }}>{email}</strong> est associée à un compte Terrimo, vous allez recevoir un lien de connexion dans les prochaines secondes.
              </p>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8125rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                Vérifiez aussi vos spams. Le lien est valable 24 heures.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: 'rgba(255,255,255,.6)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '.875rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                ← Utiliser une autre adresse
              </button>
            </div>
          )}
        </div>

        {/* Lien retour */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,.3)', fontSize: '.8125rem', textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
