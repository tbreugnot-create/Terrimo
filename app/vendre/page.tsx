'use client';

import { useState } from 'react';
import Link from 'next/link';

const COMMUNES = [
  'Arcachon', 'La Teste-de-Buch', 'Andernos-les-Bains', 'Lège-Cap-Ferret',
  'Gujan-Mestras', 'Le Teich', 'Audenge', 'Biganos', 'Marcheprime',
  'Mios', 'Salles', 'Biscarrosse', 'Cazaux',
];

const TYPES = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Immeuble', 'Autre'];

const INTENTIONS = [
  { value: 'vendre',    icon: '🏷️', label: 'Vendre',              desc: 'Mandat de vente, mise en marché' },
  { value: 'louer',     icon: '🔑', label: 'Mettre en location',   desc: 'Location annuelle ou saisonnière' },
  { value: 'evaluer',   icon: '📊', label: 'Juste estimer',        desc: 'Sans engagement, pour me positionner' },
  { value: 'diagnostiquer', icon: '🔬', label: 'Faire diagnostiquer', desc: 'DPE, amiante, loi Carrez…' },
];

const BENEFITS = [
  {
    icon: '🎯',
    title: 'Mis en relation avec les meilleures agences',
    desc: 'Vos coordonnées sont transmises aux agences premium vérifiées qui ont des acquéreurs actifs sur votre commune.',
  },
  {
    icon: '💰',
    title: 'Estimation basée sur les données DVF réelles',
    desc: 'Notre outil analyse toutes les transactions notariales des 24 derniers mois sur votre secteur.',
  },
  {
    icon: '⚡',
    title: 'Réponse en moins de 24h',
    desc: 'Les agences partenaires s\'engagent à vous contacter sous 24h avec une proposition.',
  },
  {
    icon: '🔒',
    title: 'Sans engagement',
    desc: 'Déposez votre projet librement. Aucun contrat, aucune obligation.',
  },
];

export default function VendrePage() {
  const [step,    setStep]    = useState<'intent' | 'form' | 'success'>('intent');
  const [intent,  setIntent]  = useState('');
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', commune: '', type_local: '', surface: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function set(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  // Si l'intention est "estimer", on redirige directement
  const goNext = () => {
    if (intent === 'evaluer') {
      window.location.href = '/evaluer';
      return;
    }
    if (intent === 'diagnostiquer') {
      window.location.href = '/evaluer?intention=diagnostiquer';
      return;
    }
    setStep('form');
  };

  const submit = async () => {
    if (!form.name || !form.email) { setError('Nom et email requis'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          surface:  form.surface  ? Number(form.surface)  : undefined,
          commune:  form.commune  || undefined,
          source:   `vendre_${intent}`,
          message:  form.message  || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? 'Erreur'); }
      else { setStep('success'); }
    } catch { setError('Erreur réseau, réessayez.'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
    color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };
  const cardBase: React.CSSProperties = {
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 16, padding: '18px 20px', cursor: 'pointer', transition: 'all .15s',
    textAlign: 'left',
  };
  const cardActive: React.CSSProperties = {
    ...cardBase,
    background: 'rgba(56,189,248,.1)', border: '1px solid rgba(56,189,248,.45)',
  };

  // ── Succès ──────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Votre projet est enregistré !</h1>
          <p style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 32 }}>
            Un email de confirmation vous a été envoyé à <strong>{form.email}</strong>.<br />
            Les agences partenaires vont vous contacter dans les 24h avec une proposition.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/evaluer" style={{
              display: 'inline-block', padding: '13px 24px',
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 700,
            }}>
              Obtenir mon estimation précise →
            </Link>
            <Link href="/" style={{
              display: 'inline-block', padding: '13px 24px',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.7)', textDecoration: 'none', borderRadius: 12, fontWeight: 600,
            }}>
              Voir la carte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Terri<span style={{ color: '#38bdf8' }}>mo</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <Link href="/evaluer" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Estimation gratuite</Link>
          <Link href="/acquereur" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>J&apos;achète</Link>
          <Link href="/pro/rejoindre" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Espace pro</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px' }}>

        {/* ── ÉTAPE 1 — Intention ─────────────────────────────────────────────── */}
        {step === 'intent' && (
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                display: 'inline-block', marginBottom: 16, padding: '4px 14px',
                background: 'rgba(56,189,248,.1)', border: '1px solid rgba(56,189,248,.25)',
                borderRadius: 20, fontSize: 13, color: '#7dd3fc',
              }}>
                🌊 Propriétaires Bassin d&apos;Arcachon
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 14, letterSpacing: '-0.02em' }}>
                Vous avez un bien<br />à <span style={{ color: '#38bdf8' }}>valoriser</span> ?
              </h1>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 16, lineHeight: 1.6 }}>
                Terrimo vous met en relation directe avec les meilleures agences<br />du Bassin d&apos;Arcachon — estimation gratuite et sans engagement.
              </p>
            </div>

            {/* Intentions */}
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, textAlign: 'center', color: 'rgba(255,255,255,.7)' }}>
              Quel est votre projet ?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {INTENTIONS.map(i => (
                <button key={i.value} onClick={() => setIntent(i.value)}
                  style={intent === i.value ? cardActive : cardBase}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{i.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: intent === i.value ? '#7dd3fc' : '#fff', marginBottom: 3 }}>{i.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>{i.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={!intent}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
                background: !intent ? 'rgba(255,255,255,.08)' : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                color: !intent ? 'rgba(255,255,255,.3)' : '#fff',
                fontSize: 16, fontWeight: 800, cursor: intent ? 'pointer' : 'not-allowed',
                transition: 'all .2s',
              }}>
              Continuer →
            </button>

            {/* Bénéfices */}
            <div style={{ marginTop: 56 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Pourquoi passer par Terrimo ?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {BENEFITS.map(b => (
                  <div key={b.title} style={{
                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 16, padding: 20,
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{b.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div style={{
              marginTop: 40, padding: '24px 28px',
              background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 18, textAlign: 'center',
            }}>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
                &ldquo;J&apos;ai déposé mon projet le lundi matin, deux agences m&apos;ont rappelé le jour même avec une estimation. J&apos;ai finalement signé un compromis en 3 semaines.&rdquo;
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
                — Jean-Pierre M. · Vente villa Pyla-sur-Mer · 1,2 M€
              </p>
            </div>
          </>
        )}

        {/* ── ÉTAPE 2 — Formulaire ────────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <button onClick={() => setStep('intent')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 14, marginBottom: 28, padding: 0 }}>
              ← Retour
            </button>

            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {intent === 'vendre' ? 'Votre projet de vente' :
               intent === 'louer'  ? 'Votre projet de location' :
               'Vos coordonnées'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 32 }}>
              Nous vous mettons en relation avec les agences adaptées à votre projet.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>
                  Prénom & Nom <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input type="text" placeholder="Jean-Pierre Martin" value={form.name}
                  onChange={e => set('name', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>Téléphone</label>
                <input type="tel" placeholder="06 12 34 56 78" value={form.phone}
                  onChange={e => set('phone', e.target.value)} style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>
                Email <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input type="email" placeholder="votre@email.com" value={form.email}
                onChange={e => set('email', e.target.value)} style={inp} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>Commune</label>
                <select value={form.commune} onChange={e => set('commune', e.target.value)}
                  style={{ ...inp, appearance: 'none' }}>
                  <option value="">Sélectionner…</option>
                  {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>Type de bien</label>
                <select value={form.type_local} onChange={e => set('type_local', e.target.value)}
                  style={{ ...inp, appearance: 'none' }}>
                  <option value="">Sélectionner…</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>Surface approximative (m²)</label>
              <input type="number" placeholder="ex : 120" value={form.surface}
                onChange={e => set('surface', e.target.value)} style={inp} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 }}>Message (optionnel)</label>
              <textarea rows={3} placeholder="Précisez votre situation : délai, raison de la vente, travaux éventuels…"
                value={form.message} onChange={e => set('message', e.target.value)}
                style={{ ...inp, height: 'auto', resize: 'vertical' }} />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Double CTA */}
            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button onClick={submit} disabled={loading || !form.name || !form.email}
                style={{
                  padding: '15px 0', borderRadius: 14, border: 'none',
                  background: loading ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  color: '#fff', fontSize: 16, fontWeight: 800,
                  cursor: (loading || !form.name || !form.email) ? 'not-allowed' : 'pointer',
                  opacity: !form.name || !form.email ? 0.5 : 1,
                }}>
                {loading ? '⏳ Envoi en cours…' : '🎯 Être mis en relation avec les agences →'}
              </button>

              {(intent === 'vendre' || intent === 'louer') && (
                <Link href={`/evaluer${intent === 'louer' ? '?intention=louer' : ''}`}
                  style={{
                    display: 'block', textAlign: 'center', padding: '14px 0', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)',
                    textDecoration: 'none', fontSize: 15, fontWeight: 600,
                  }}>
                  📊 Obtenir mon estimation précise en premier
                </Link>
              )}
            </div>

            <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,.3)', textAlign: 'center' }}>
              🔒 Données confidentielles — transmises uniquement aux agences partenaires vérifiées
            </p>
          </>
        )}
      </div>
    </div>
  );
}
