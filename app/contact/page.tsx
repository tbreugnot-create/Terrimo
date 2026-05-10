'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

const SUBJECTS = [
  'Rejoindre Terrimo (pro)',
  'Question sur les tarifs',
  'Signaler un problème',
  'Partenariat',
  'Presse / Média',
  'Autre',
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: SUBJECTS[0], message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Erreur');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)', color: 'white' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(40px,7vh,72px) 24px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8125rem', color: 'rgba(255,255,255,.35)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>Terrimo</Link>
          <span>›</span>
          <span style={{ color: 'rgba(255,255,255,.7)' }}>Contact</span>
        </nav>

        <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-.03em', marginBottom: 10 }}>
          Contactez-nous
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '1rem', lineHeight: 1.65, marginBottom: 40, maxWidth: 480 }}>
          Une question sur Terrimo, les tarifs ou un partenariat ? Réponse sous 24h ouvrées.
        </p>

        {done ? (
          <div style={{
            background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)',
            borderRadius: 20, padding: '48px 36px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: 10 }}>Message envoyé !</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9375rem', marginBottom: 28, lineHeight: 1.65 }}>
              Nous vous répondrons à <strong style={{ color: 'rgba(255,255,255,.8)' }}>{form.email}</strong> sous 24h ouvrées.
            </p>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '11px 24px', borderRadius: 12,
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.8)', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none',
            }}>
              ← Retour à la carte
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Nom + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 8, letterSpacing: '.04em' }}>
                  NOM *
                </label>
                <input
                  type="text" required value={form.nom}
                  onChange={e => set('nom', e.target.value)}
                  placeholder="Votre nom"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 12, padding: '12px 16px',
                    color: 'white', fontSize: '.9375rem', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 8, letterSpacing: '.04em' }}>
                  EMAIL *
                </label>
                <input
                  type="email" required value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="vous@agence.fr"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 12, padding: '12px 16px',
                    color: 'white', fontSize: '.9375rem', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 10, letterSpacing: '.04em' }}>
                SUJET
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUBJECTS.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => set('sujet', s)}
                    style={{
                      padding: '7px 14px', borderRadius: 100, fontSize: '.8125rem', fontWeight: 600,
                      background: form.sujet === s ? 'rgba(99,102,241,.3)' : 'rgba(255,255,255,.06)',
                      border: `1px solid ${form.sujet === s ? 'rgba(99,102,241,.5)' : 'rgba(255,255,255,.1)'}`,
                      color: form.sujet === s ? '#a5b4fc' : 'rgba(255,255,255,.5)',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 8, letterSpacing: '.04em' }}>
                MESSAGE *
              </label>
              <textarea
                required value={form.message}
                onChange={e => set('message', e.target.value)}
                rows={6}
                placeholder="Décrivez votre demande…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 12, padding: '14px 16px',
                  color: 'white', fontSize: '.9375rem', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 10, padding: '12px 16px', fontSize: '.875rem', color: '#fca5a5',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <Link href="/" style={{
                flex: 1, textAlign: 'center', padding: '13px',
                borderRadius: 14, border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.5)', fontWeight: 600, fontSize: '.9375rem',
                textDecoration: 'none',
              }}>
                Annuler
              </Link>
              <button
                type="submit" disabled={submitting}
                style={{
                  flex: 2, padding: '13px', borderRadius: 14,
                  background: submitting ? 'rgba(99,102,241,.5)' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                  color: 'white', fontWeight: 700, fontSize: '.9375rem',
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: submitting ? 'none' : '0 4px 20px rgba(99,102,241,.35)',
                  transition: 'all .15s',
                }}
              >
                {submitting ? 'Envoi en cours…' : 'Envoyer le message →'}
              </button>
            </div>

          </form>
        )}

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 56 }}>
          {[
            { icon: '📧', title: 'Email direct', desc: 'contact@terrimo.homes', href: 'mailto:contact@terrimo.homes' },
            { icon: '🏡', title: 'Pros & agences', desc: 'Rejoignez Terrimo', href: '/pro/rejoindre' },
            { icon: '💎', title: 'Tarifs', desc: 'Plans Free, Pro, Premium', href: '/tarifs' },
          ].map(c => (
            <a key={c.title} href={c.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 16, padding: '20px 22px',
                transition: 'border-color .15s',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.9375rem', color: 'rgba(255,255,255,.9)', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)' }}>{c.desc}</div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}
