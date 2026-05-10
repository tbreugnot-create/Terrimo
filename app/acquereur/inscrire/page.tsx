'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type FormData = {
  // Étape 1 — Projet
  type_acquisition: string;
  horizon: string;
  premiere_acquisition: boolean;

  // Étape 2 — Communes
  communes: string[];

  // Étape 3 — Bien
  types_bien: string[];
  surface_min: string;
  surface_max: string;
  chambres_min: string;
  caracteristiques: string[];
  accepte_renovation: boolean;

  // Étape 4 — Budget & financement
  budget_max: string;
  mode_financement: string;
  accord_bancaire: boolean;
  apport: string;

  // Étape 5 — Contact
  prenom: string;
  email: string;
  phone: string;
  description: string;
};

const INIT: FormData = {
  type_acquisition: '', horizon: '', premiere_acquisition: false,
  communes: [],
  types_bien: [], surface_min: '', surface_max: '', chambres_min: '',
  caracteristiques: [], accepte_renovation: true,
  budget_max: '', mode_financement: '', accord_bancaire: false, apport: '',
  prenom: '', email: '', phone: '', description: '',
};

// ─── Données ──────────────────────────────────────────────────────────────────
const COMMUNES_BASSIN = [
  'Arcachon', 'La Teste-de-Buch', 'Andernos-les-Bains', 'Lège-Cap-Ferret',
  'Gujan-Mestras', 'Le Teich', 'Audenge', 'Biganos', 'Marcheprime',
  'Mios', 'Salles', 'Cazaux', 'Biscarrosse',
];

const TYPES_BIEN = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Immeuble', 'Commerce'];
const CARACT = ['Vue mer / lac', 'Piscine', 'Garage', 'Grande terrasse', 'Jardin', 'Proche plage', 'Calme', 'Standing'];

const ACQUISITIONS = [
  { value: 'residence_principale', label: '🏠 Résidence principale' },
  { value: 'residence_secondaire', label: '🌊 Résidence secondaire' },
  { value: 'investissement',       label: '📈 Investissement locatif' },
  { value: 'location_saisonniere', label: '☀️ Location saisonnière' },
];

const HORIZONS = [
  { value: '1mois',       label: 'Moins d\'1 mois' },
  { value: '3mois',       label: '1 à 3 mois' },
  { value: '6mois',       label: '3 à 6 mois' },
  { value: '1an',         label: '6 mois à 1 an' },
  { value: 'sans_urgence', label: 'Sans urgence' },
];

const FINANCEMENTS = [
  { value: 'comptant', label: '💰 Comptant', desc: 'Achat sans crédit' },
  { value: 'credit',   label: '🏦 Crédit', desc: 'Financement bancaire' },
  { value: 'non_decide', label: '🤔 Non décidé', desc: 'À définir' },
];

// ─── Composants helpers ───────────────────────────────────────────────────────
const S = {
  card: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
    transition: 'all .2s',
  },
  cardActive: {
    background: 'rgba(56,189,248,.12)',
    border: '1px solid rgba(56,189,248,.5)',
    borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
    transition: 'all .2s',
  },
  pill: {
    padding: '8px 16px', borderRadius: 24, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, transition: 'all .15s',
    border: '1px solid rgba(255,255,255,.1)',
    background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)',
  },
  pillActive: {
    padding: '8px 16px', borderRadius: 24, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, transition: 'all .15s',
    border: '1px solid rgba(56,189,248,.5)',
    background: 'rgba(56,189,248,.15)', color: '#7dd3fc',
  },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
    color: '#fff', fontSize: 15, outline: 'none',
    boxSizing: 'border-box' as const,
  },
};

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function InscriptionAcquereur() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState<FormData>(INIT);
  const [loading, setLoading] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState('');

  const TOTAL_STEPS = 5;
  const progress = (step / TOTAL_STEPS) * 100;

  function set(key: keyof FormData, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit() {
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        budget_max:  form.budget_max  ? Number(form.budget_max.replace(/\s/g, ''))  : null,
        surface_min: form.surface_min ? Number(form.surface_min) : null,
        surface_max: form.surface_max ? Number(form.surface_max) : null,
        chambres_min: form.chambres_min ? Number(form.chambres_min) : null,
        apport:      form.apport      ? Number(form.apport.replace(/\s/g, ''))  : null,
        communes:    form.communes.map(c => c.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')),
        types_bien:  form.types_bien.map(t => t.toLowerCase()),
      };
      const res = await fetch('/api/mandats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'envoi');
      } else {
        setDone(true);
      }
    } catch {
      setError('Erreur réseau. Réessayez dans quelques secondes.');
    } finally {
      setLoading(false);
    }
  }

  // ── Succès ──────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Votre recherche est active !
          </h1>
          <p style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 32 }}>
            Un email de confirmation vous a été envoyé à <strong>{form.email}</strong>.<br />
            Les agences partenaires du Bassin d&apos;Arcachon vont être notifiées. Vous devriez recevoir des propositions dans les 24-48h.
          </p>
          <div style={{
            background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.25)',
            borderRadius: 16, padding: 20, marginBottom: 32,
          }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: 0 }}>
              ✅ Communes : {form.communes.join(', ')}<br />
              ✅ Budget max : {form.budget_max ? Number(form.budget_max.replace(/\s/g, '')).toLocaleString('fr-FR') + ' €' : '—'}<br />
              ✅ Alerte active pendant 6 mois
            </p>
          </div>
          <Link href="/" style={{
            display: 'inline-block', padding: '14px 32px',
            background: 'rgba(56,189,248,.2)', border: '1px solid rgba(56,189,248,.4)',
            color: '#7dd3fc', textDecoration: 'none', borderRadius: 12, fontWeight: 700,
          }}>
            Voir les biens disponibles →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/acquereur" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontSize: 14 }}>← Retour</Link>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>
          Étape {step}/{TOTAL_STEPS}
        </span>
      </nav>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,.08)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', transition: 'width .4s' }} />
      </div>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── ÉTAPE 1 — Projet ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Votre projet</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 32 }}>Quel type d&apos;acquisition souhaitez-vous ?</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {ACQUISITIONS.map(a => (
                <button key={a.value} onClick={() => set('type_acquisition', a.value)}
                  style={form.type_acquisition === a.value ? S.cardActive : S.card}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: form.type_acquisition === a.value ? '#7dd3fc' : 'rgba(255,255,255,.8)' }}>
                    {a.label}
                  </span>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Votre horizon de recherche</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {HORIZONS.map(h => (
                <button key={h.value} onClick={() => set('horizon', h.value)}
                  style={form.horizon === h.value ? S.pillActive : S.pill}>
                  {h.label}
                </button>
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.premiere_acquisition}
                onChange={e => set('premiere_acquisition', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }} />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                C&apos;est ma première acquisition immobilière
              </span>
            </label>
          </div>
        )}

        {/* ── ÉTAPE 2 — Communes ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Vos communes</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 32 }}>
              Sélectionnez une ou plusieurs communes du Bassin d&apos;Arcachon.
              <br /><span style={{ fontSize: 13 }}>{form.communes.length} sélectionnée{form.communes.length > 1 ? 's' : ''}</span>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {COMMUNES_BASSIN.map(c => (
                <button key={c} onClick={() => set('communes', toggle(form.communes, c))}
                  style={form.communes.includes(c) ? S.pillActive : S.pill}>
                  📍 {c}
                </button>
              ))}
            </div>

            {form.communes.length > 0 && (
              <div style={{
                marginTop: 24, padding: '12px 16px',
                background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.2)',
                borderRadius: 12, fontSize: 13, color: '#7dd3fc',
              }}>
                ✓ {form.communes.join(' · ')}
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 3 — Bien recherché ─────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Votre bien idéal</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 28 }}>Précisez vos critères (tous optionnels sauf le type)</p>

            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Type de bien</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {TYPES_BIEN.map(t => (
                <button key={t} onClick={() => set('types_bien', toggle(form.types_bien, t))}
                  style={form.types_bien.includes(t) ? S.pillActive : S.pill}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>Surface min (m²)</label>
                <input type="number" placeholder="ex : 80" value={form.surface_min}
                  onChange={e => set('surface_min', e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>Surface max (m²)</label>
                <input type="number" placeholder="ex : 200" value={form.surface_max}
                  onChange={e => set('surface_max', e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>Chambres min</label>
                <input type="number" placeholder="ex : 3" value={form.chambres_min}
                  onChange={e => set('chambres_min', e.target.value)} style={S.input} />
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Critères souhaités</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {CARACT.map(c => (
                <button key={c} onClick={() => set('caracteristiques', toggle(form.caracteristiques, c))}
                  style={form.caracteristiques.includes(c) ? S.pillActive : S.pill}>
                  {c}
                </button>
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.accepte_renovation}
                onChange={e => set('accepte_renovation', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }} />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>J&apos;accepte un bien avec travaux</span>
            </label>
          </div>
        )}

        {/* ── ÉTAPE 4 — Budget ────────────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Budget & financement</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 32 }}>Aidez les agences à vous proposer les biens adaptés</p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 8 }}>
                Budget maximum <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="ex : 650 000" value={form.budget_max}
                  onChange={e => set('budget_max', e.target.value)}
                  style={{ ...S.input, paddingRight: 36 }} />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>€</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 6 }}>Tous frais compris (frais de notaire, agence)</p>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 8 }}>Apport personnel (optionnel)</label>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="ex : 150 000" value={form.apport}
                  onChange={e => set('apport', e.target.value)}
                  style={{ ...S.input, paddingRight: 36 }} />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>€</span>
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Mode de financement</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
              {FINANCEMENTS.map(f => (
                <button key={f.value} onClick={() => set('mode_financement', f.value)}
                  style={form.mode_financement === f.value ? S.cardActive : S.card}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: form.mode_financement === f.value ? '#7dd3fc' : '#fff' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{f.desc}</div>
                </button>
              ))}
            </div>

            {form.mode_financement === 'credit' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.accord_bancaire}
                  onChange={e => set('accord_bancaire', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                  J&apos;ai déjà un accord de principe bancaire ✅
                </span>
              </label>
            )}
          </div>
        )}

        {/* ── ÉTAPE 5 — Contact ────────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Vos coordonnées</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 32 }}>
              Transmises uniquement aux agences premium vérifiées si un bien correspond.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>Prénom</label>
                <input type="text" placeholder="Marie" value={form.prenom}
                  onChange={e => set('prenom', e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>Téléphone</label>
                <input type="tel" placeholder="06 12 34 56 78" value={form.phone}
                  onChange={e => set('phone', e.target.value)} style={S.input} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>
                Email <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input type="email" placeholder="votre@email.com" value={form.email}
                onChange={e => set('email', e.target.value)} style={S.input} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'block', marginBottom: 6 }}>
                Précisez votre recherche (optionnel)
              </label>
              <textarea rows={4} placeholder="Ex : Je cherche idéalement une maison avec vue sur le Bassin, calme, avec jardin. Pas de copropriété si possible..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                style={{ ...S.input, height: 'auto', resize: 'vertical' }} />
            </div>

            <div style={{
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12, padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 8,
            }}>
              🔒 Vos données sont protégées. Coordonnées partagées uniquement avec les agences premium qui ont un bien correspondant. Jamais revendues à des tiers.
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 12, color: '#fca5a5', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{
              padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)',
              background: 'transparent', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>
              ← Précédent
            </button>
          ) : (
            <Link href="/acquereur" style={{
              padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)',
              color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 14, fontWeight: 600,
            }}>
              ← Retour
            </Link>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && (!form.type_acquisition || !form.horizon)) ||
                (step === 2 && form.communes.length === 0) ||
                (step === 4 && !form.budget_max)
              }
              style={{
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700,
                opacity: (
                  (step === 1 && (!form.type_acquisition || !form.horizon)) ||
                  (step === 2 && form.communes.length === 0) ||
                  (step === 4 && !form.budget_max)
                ) ? 0.4 : 1,
                transition: 'opacity .2s',
              }}>
              Continuer →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!form.email || loading}
              style={{
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: loading ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                color: '#fff', cursor: loading ? 'wait' : 'pointer',
                fontSize: 15, fontWeight: 800, opacity: !form.email ? 0.4 : 1,
              }}>
              {loading ? '⏳ Envoi en cours…' : '🎯 Déposer ma recherche →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
