'use client';

import { useState } from 'react';
import Link from 'next/link';

const COMMUNES = [
  'Arcachon', 'La Teste-de-Buch', 'Lège-Cap-Ferret', 'Andernos-les-Bains',
  'Gujan-Mestras', 'Le Teich', 'Audenge', 'Biganos', 'Pyla-sur-Mer',
  'Le Canon', 'Claouey', 'Arès', 'Lanton', 'Mios',
];

const TYPES_BIEN = ['Maison', 'Villa', 'Appartement', 'Studio', 'Duplex', 'Autre'];

const DUREES = [
  { value: 'saisonniere', icon: '☀️', label: 'Location saisonnière', desc: 'Semaines ou mois — été, vacances, Noël' },
  { value: 'annuelle',    icon: '📅', label: 'Location annuelle',    desc: 'Bail résidentiel, locataire stable' },
  { value: 'mixte',       icon: '🔄', label: 'Mixte',                desc: 'Saisonnier l\'été, annuel hors-saison' },
];

const PARTENAIRES = [
  { icon: '🏡', type: 'Conciergerie', desc: 'Gestion clés en main : ménage, accueil, linge, Airbnb. Idéal location saisonnière.' },
  { icon: '🏢', type: 'Agence locative', desc: 'Recherche de locataires, bail, quittances, état des lieux. Idéal location annuelle.' },
  { icon: '🔧', type: 'Gestionnaire patrimoine', desc: 'Optimisation fiscale, LMNP, comptabilité locative. Idéal multi-biens.' },
];

const AVANTAGES = [
  { icon: '🎯', title: 'Partenaires vérifiés', desc: 'Conciergeries et agences sélectionnées sur leur réputation locale et leurs avis clients.' },
  { icon: '⚡', title: 'Réponse sous 24h', desc: 'Vos coordonnées sont transmises aux partenaires disponibles sur votre commune.' },
  { icon: '🆓', title: 'Gratuit pour vous', desc: 'La mise en relation est offerte. Aucune commission prélevée par Terrimo sur vos revenus locatifs.' },
  { icon: '🌊', title: '100% local Bassin', desc: 'Des professionnels qui connaissent le marché saisonnier du Bassin et ses particularités.' },
];

export default function LouerPage() {
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [duree, setDuree] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    commune: '', type_local: '', surface: '',
    loyer_cible: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email) { setError('Nom et email requis'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          surface: form.surface ? Number(form.surface) : undefined,
          commune: form.commune || undefined,
          source: `louer_${duree}`,
          message: [
            duree ? `Durée : ${duree}` : '',
            form.loyer_cible ? `Loyer cible : ${form.loyer_cible} €` : '',
            form.message,
          ].filter(Boolean).join(' — ') || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStep('success');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ─── SUCCÈS ────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ minHeight: 'calc(100dvh - 68px)', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'white' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Votre projet est envoyé !</h1>
          <p style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.7, marginBottom: 32 }}>
            Les conciergeries et agences partenaires disponibles sur <strong style={{ color: 'white' }}>{form.commune || 'votre commune'}</strong> vont vous contacter sous 24h.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/evaluer" style={{ padding: '12px 22px', borderRadius: 12, background: '#6366f1', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
              Estimer mes revenus DVF
            </Link>
            <Link href="/" style={{ padding: '12px 22px', borderRadius: 12, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.75)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
              Explorer la carte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
    color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = { fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 };

  return (
    <div style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 56px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: 20, padding: '4px 14px',
          background: 'rgba(56,189,248,.12)', border: '1px solid rgba(56,189,248,.3)',
          borderRadius: 20, fontSize: 13, color: '#7dd3fc',
        }}>
          🌊 Bassin d&apos;Arcachon · Location saisonnière & annuelle
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em' }}>
          Mettez votre bien<br />
          <span style={{ color: '#38bdf8' }}>en location</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.7, marginBottom: 12, maxWidth: 520, margin: '0 auto 12px' }}>
          Trouvez la conciergerie ou l&apos;agence locative idéale pour votre bien sur le Bassin.
          Location saisonnière, annuelle ou mixte — réponse sous 24h.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 40 }}>
          Service gratuit pour les propriétaires · Professionnels vérifiés
        </p>

        {step === 'intro' && (
          <>
            {/* Sélection durée */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32, textAlign: 'left' }}>
              {DUREES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuree(d.value)}
                  style={{
                    background: duree === d.value ? 'rgba(56,189,248,.15)' : 'rgba(255,255,255,.04)',
                    border: `2px solid ${duree === d.value ? '#38bdf8' : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 16, padding: '18px 20px', cursor: 'pointer',
                    color: 'white', textAlign: 'left', transition: 'all .15s',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{d.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{d.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('form')}
              disabled={!duree}
              style={{
                padding: '14px 36px', borderRadius: 14, fontSize: '1rem', fontWeight: 800,
                background: duree ? '#38bdf8' : 'rgba(255,255,255,.1)',
                color: duree ? '#0a1626' : 'rgba(255,255,255,.3)',
                border: 'none', cursor: duree ? 'pointer' : 'not-allowed',
                transition: 'all .2s',
              }}
            >
              Trouver mon partenaire →
            </button>
          </>
        )}
      </section>

      {/* ─── Formulaire ─────────────────────────────────────── */}
      {step === 'form' && (
        <section style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 64px' }}>
          <button
            onClick={() => setStep('intro')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.45)', cursor: 'pointer', fontSize: 14, marginBottom: 28, padding: 0 }}
          >
            ← Retour
          </button>

          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Votre projet de location</h2>
          <p style={{ color: 'rgba(255,255,255,.45)', marginBottom: 32, fontSize: 14 }}>
            {DUREES.find(d => d.value === duree)?.icon} {DUREES.find(d => d.value === duree)?.label} — nous vous mettons en relation avec les meilleurs partenaires.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Identité */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Prénom & Nom <span style={{ color: '#f87171' }}>*</span></label>
                <input style={inputStyle} placeholder="Jean Dupont" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input style={inputStyle} placeholder="06 xx xx xx xx" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email <span style={{ color: '#f87171' }}>*</span></label>
              <input style={inputStyle} type="email" placeholder="jean@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            {/* Bien */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Commune</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.commune} onChange={e => set('commune', e.target.value)}>
                  <option value="">Choisir…</option>
                  {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Type de bien</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type_local} onChange={e => set('type_local', e.target.value)}>
                  <option value="">Choisir…</option>
                  {TYPES_BIEN.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Surface (m²)</label>
                <input style={inputStyle} type="number" placeholder="85" value={form.surface} onChange={e => set('surface', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Loyer cible (€/mois ou €/sem.)</label>
                <input style={inputStyle} type="number" placeholder="1200" value={form.loyer_cible} onChange={e => set('loyer_cible', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Informations complémentaires</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                placeholder="Ex : piscine, parking, disponible dès juin…"
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

            <button
              onClick={submit}
              disabled={loading}
              style={{
                padding: '14px', borderRadius: 12, fontWeight: 800, fontSize: '1rem',
                background: loading ? 'rgba(56,189,248,.4)' : '#38bdf8',
                color: '#0a1626', border: 'none', cursor: loading ? 'default' : 'pointer',
                transition: 'all .2s',
              }}
            >
              {loading ? 'Envoi en cours…' : 'Trouver mon partenaire →'}
            </button>
          </div>
        </section>
      )}

      {/* ─── Types de partenaires ───────────────────────────── */}
      {step === 'intro' && (
        <>
          <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 64px' }}>
            <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', marginBottom: 32 }}>
              Quel partenaire pour votre projet ?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {PARTENAIRES.map(p => (
                <div key={p.type} style={{
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 18, padding: '24px 22px',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 14 }}>{p.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{p.type}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Avantages */}
          <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 64px' }}>
            <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', marginBottom: 32 }}>
              Pourquoi passer par Terrimo ?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {AVANTAGES.map(a => (
                <div key={a.title} style={{
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 16, padding: '20px',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Revenus locatifs indicatifs Bassin */}
          <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,.08), rgba(56,189,248,.03))',
              border: '1px solid rgba(56,189,248,.2)', borderRadius: 20, padding: '32px',
            }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: 24, textAlign: 'center' }}>
                💰 Revenus locatifs indicatifs — Bassin d&apos;Arcachon 2024
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  { commune: 'Arcachon', saison: '2 800–4 500 €/sem.', annuel: '1 400–2 200 €/mois' },
                  { commune: 'Cap Ferret', saison: '3 500–6 000 €/sem.', annuel: '1 600–2 800 €/mois' },
                  { commune: 'La Teste', saison: '1 800–3 200 €/sem.', annuel: '900–1 500 €/mois' },
                  { commune: 'Andernos', saison: '1 400–2 500 €/sem.', annuel: '800–1 300 €/mois' },
                ].map(r => (
                  <div key={r.commune} style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,.04)', borderRadius: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, color: '#38bdf8' }}>{r.commune}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>☀️ Haute saison</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{r.saison}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>📅 Annuel</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.annuel}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textAlign: 'center', marginTop: 20 }}>
                Données indicatives 2024 · Pour une maison 4 pièces, bon état. Fourchette haute = vue mer ou piscine.
              </p>
            </div>
          </section>

          {/* CTA bas de page */}
          <section style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
            <Link href="/conciergeries" style={{
              display: 'inline-block', padding: '11px 22px', borderRadius: 12,
              background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
              color: 'rgba(255,255,255,.6)', fontSize: 14, textDecoration: 'none',
            }}>
              🏡 Voir les conciergeries partenaires →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
