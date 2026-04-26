'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { VILLAGES, VILLAGES_BY_COMMUNE } from '@/lib/villages';

const CARACTERISTIQUES = [
  { value: 'piscine', label: '🏊 Piscine' },
  { value: 'garage', label: '🚗 Garage' },
  { value: 'vue_bassin', label: '🌊 Vue bassin' },
  { value: 'acces_plage', label: '🏖️ Accès plage' },
  { value: 'plain_pied', label: '🏠 Plain-pied' },
  { value: 'terrasse', label: '☀️ Terrasse/jardin' },
];

const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const TOTAL_STEPS = 5;

// ─── Types ────────────────────────────────────────────────
interface FormData {
  // Étape 1
  type_acquisition: string;
  horizon: string;
  premiere_acquisition: boolean;
  // Étape 2
  communes: string[];
  proximites: string[];
  accepte_renovation: boolean;
  // Étape 3
  types_bien: string[];
  surface_min: string;
  chambres_min: string;
  terrain_souhaite: boolean;
  caracteristiques: string[];
  // Étape 4
  budget_max: string;
  mode_financement: string;
  accord_bancaire: boolean;
  eligible_ptz: boolean;
  description: string;
  // Étape 5
  prenom: string;
  email: string;
  phone: string;
}

const INITIAL: FormData = {
  type_acquisition: '', horizon: '', premiere_acquisition: false,
  communes: [], proximites: [], accepte_renovation: true,
  types_bien: [], surface_min: '', chambres_min: '', terrain_souhaite: false, caracteristiques: [],
  budget_max: '', mode_financement: '', accord_bancaire: false, eligible_ptz: false, description: '',
  prenom: '', email: '', phone: '',
};

// ─── Helpers ──────────────────────────────────────────────
function Toggle({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'white',
      }}
    >
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? '#0ea5e9' : 'rgba(255,255,255,.15)',
        position: 'relative', transition: 'background .2s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left .2s',
        }} />
      </div>
      <span style={{ fontSize: '.9375rem', color: 'rgba(255,255,255,.85)' }}>{label}</span>
    </button>
  );
}

function ChipToggle({
  value, label, active, onClick,
}: { value: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 18px', borderRadius: 10, fontSize: '.875rem', fontWeight: 500, cursor: 'pointer',
        border: active ? '2px solid #0ea5e9' : '2px solid rgba(255,255,255,.12)',
        background: active ? 'rgba(14,165,233,.18)' : 'rgba(255,255,255,.05)',
        color: active ? '#7dd3fc' : 'rgba(255,255,255,.7)',
        transition: 'all .15s',
      }}
    >{label}</button>
  );
}

function InputField({
  label, type = 'text', value, onChange, placeholder, prefix,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.8125rem', color: 'rgba(255,255,255,.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)', fontSize: '.9375rem' }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: prefix ? '14px 14px 14px 36px' : '14px',
            borderRadius: 10, border: '1px solid rgba(255,255,255,.12)',
            background: 'rgba(255,255,255,.06)', color: 'white', fontSize: '1rem',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────
export default function RechercherPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Pré-remplir depuis URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'investissement') setForm(f => ({ ...f, type_acquisition: 'investissement' }));
  }, []);

  const set = (key: keyof FormData, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const toggleArray = (key: keyof FormData, val: string) => {
    const arr = (form[key] as string[]);
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const canNext = () => {
    if (step === 1) return !!form.type_acquisition && !!form.horizon;
    if (step === 2) return form.communes.length > 0;
    if (step === 3) return form.types_bien.length > 0;
    if (step === 4) return !!form.budget_max && !!form.mode_financement;
    if (step === 5) return !!form.email && !!form.prenom;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        communes: form.communes.map(c => VILLAGES.find(v => v.name === c)?.slug ?? c.toLowerCase().replace(/\s+/g, '-')),
        budget_max: parseInt(form.budget_max) || null,
        surface_min: parseInt(form.surface_min) || null,
        chambres_min: parseInt(form.chambres_min) || null,
      };
      const res = await fetch('/api/mandats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      setDone(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const S: CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #071625 0%, #0c2340 60%, #0a1e35 100%)',
    padding: '40px 20px 80px',
    fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
  };

  // ── Succès ──
  if (done) {
    return (
      <div style={S}>
        <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>✅</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: 12 }}>
            Votre alerte est active !
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: 32 }}>
            Nous avons notifié les agences partenaires de votre secteur. Vous recevrez un email de confirmation et serez contacté(e) dès qu'un bien correspond à votre recherche.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '14px 32px', borderRadius: 12, background: '#0ea5e9',
              color: 'white', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer',
            }}
          >
            Explorer la carte →
          </button>
        </div>
      </div>
    );
  }

  const progressPct = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div style={S}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(14,165,233,.12)', border: '1px solid rgba(14,165,233,.25)',
            borderRadius: 8, padding: '4px 14px', marginBottom: 16,
            color: '#7dd3fc', fontSize: '.8125rem', fontWeight: 600, letterSpacing: '.06em',
          }}>
            🔍 MANDAT DE RECHERCHE
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-.02em' }}>
            Trouvez votre bien idéal
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9375rem' }}>
            Les agences du Bassin d'Arcachon vous contactent directement
          </p>
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)' }}>Étape {step} sur {TOTAL_STEPS}</span>
            <span style={{ fontSize: '.8rem', color: '#0ea5e9', fontWeight: 600 }}>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, background: '#0ea5e9', width: `${progressPct}%`, transition: 'width .3s ease' }} />
          </div>
        </div>

        {/* Carte du formulaire */}
        <div style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 20, padding: '32px 28px',
        }}>

          {/* ── Étape 1 — Projet ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Votre projet</h2>

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Type d'acquisition</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { value: 'résidence_principale', label: '🏠 Résidence principale' },
                    { value: 'résidence_secondaire', label: '🌴 Résidence secondaire' },
                    { value: 'investissement', label: '📈 Investissement locatif' },
                  ].map(opt => (
                    <ChipToggle key={opt.value} value={opt.value} label={opt.label}
                      active={form.type_acquisition === opt.value}
                      onClick={() => set('type_acquisition', opt.value)} />
                  ))}
                </div>
              </div>

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Horizon d'achat</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { value: 'immediat', label: '⚡ Dès que possible' },
                    { value: '3mois', label: '📅 3 mois' },
                    { value: '6mois', label: '📅 6 mois' },
                    { value: '1an', label: '🗓️ 1 an+' },
                  ].map(opt => (
                    <ChipToggle key={opt.value} value={opt.value} label={opt.label}
                      active={form.horizon === opt.value}
                      onClick={() => set('horizon', opt.value)} />
                  ))}
                </div>
              </div>

              <Toggle checked={form.premiere_acquisition} onToggle={() => set('premiere_acquisition', !form.premiere_acquisition)} label="Première acquisition (éligibilité PTZ)" />
            </div>
          )}

          {/* ── Étape 2 — Localisation ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Localisation souhaitée</h2>

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Villages & communes ({form.communes.length} sélectionné{form.communes.length > 1 ? 's' : ''})
                </p>
                {Object.entries(VILLAGES_BY_COMMUNE).map(([communeName, villages]) => (
                  <div key={communeName} style={{ marginBottom: 16 }}>
                    <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.75rem', fontWeight: 600, marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                      {communeName}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {villages.map(v => (
                        <ChipToggle key={v.slug} value={v.name} label={v.name}
                          active={form.communes.includes(v.name)}
                          onClick={() => toggleArray('communes', v.name)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Proximité souhaitée</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { value: 'plage', label: '🏖️ Plage' },
                    { value: 'centre', label: '🏙️ Centre-ville' },
                    { value: 'foret', label: '🌲 Forêt' },
                    { value: 'bassin', label: '🌊 Bord du bassin' },
                    { value: 'ecoles', label: '🏫 Écoles' },
                  ].map(opt => (
                    <ChipToggle key={opt.value} value={opt.value} label={opt.label}
                      active={form.proximites.includes(opt.value)}
                      onClick={() => toggleArray('proximites', opt.value)} />
                  ))}
                </div>
              </div>

              <Toggle checked={form.accepte_renovation} onToggle={() => set('accepte_renovation', !form.accepte_renovation)} label="J'accepte un bien à rénover si bien situé" />
            </div>
          )}

          {/* ── Étape 3 — Bien ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Type de bien recherché</h2>

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Type</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { value: 'maison', label: '🏡 Maison' },
                    { value: 'appartement', label: '🏢 Appartement' },
                    { value: 'terrain', label: '🌿 Terrain' },
                    { value: 'neuf', label: '🏗️ Programme neuf' },
                  ].map(opt => (
                    <ChipToggle key={opt.value} value={opt.value} label={opt.label}
                      active={form.types_bien.includes(opt.value)}
                      onClick={() => toggleArray('types_bien', opt.value)} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputField label="Surface min (m²)" type="number" value={form.surface_min} onChange={v => set('surface_min', v)} placeholder="Ex : 80" />
                <InputField label="Chambres min" type="number" value={form.chambres_min} onChange={v => set('chambres_min', v)} placeholder="Ex : 3" />
              </div>

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Caractéristiques souhaitées</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CARACTERISTIQUES.map(c => (
                    <ChipToggle key={c.value} value={c.value} label={c.label}
                      active={form.caracteristiques.includes(c.value)}
                      onClick={() => toggleArray('caracteristiques', c.value)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Étape 4 — Budget & financement ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Budget & financement</h2>

              <InputField label="Budget maximum (FAI)" type="number" value={form.budget_max} onChange={v => set('budget_max', v)} placeholder="Ex : 650000" prefix="€" />

              <div>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8125rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mode de financement</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { value: 'comptant', label: '💰 Comptant' },
                    { value: 'credit', label: '🏦 Crédit' },
                    { value: 'mixte', label: '🔀 Mixte' },
                  ].map(opt => (
                    <ChipToggle key={opt.value} value={opt.value} label={opt.label}
                      active={form.mode_financement === opt.value}
                      onClick={() => set('mode_financement', opt.value)} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Toggle checked={form.accord_bancaire} onToggle={() => set('accord_bancaire', !form.accord_bancaire)} label="Accord de principe bancaire obtenu" />
                <Toggle checked={form.eligible_ptz} onToggle={() => set('eligible_ptz', !form.eligible_ptz)} label="Éligible au PTZ (Prêt à Taux Zéro)" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.8125rem', color: 'rgba(255,255,255,.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Description libre (facultatif)
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={'Ex : "Cherche maison de pêcheur authentique, vue sur le bassin, peu importe l\'état..."'}
                  rows={3}
                  style={{
                    width: '100%', padding: 14, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,.12)',
                    background: 'rgba(255,255,255,.06)', color: 'white', fontSize: '.9375rem',
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Étape 5 — Contact ── */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Vos coordonnées</h2>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', margin: 0 }}>
                Transmises uniquement aux agences si un bien correspond. Profil anonymisé dans les alertes.
              </p>

              <InputField label="Prénom" value={form.prenom} onChange={v => set('prenom', v)} placeholder="Votre prénom" />
              <InputField label="Email *" type="email" value={form.email} onChange={v => set('email', v)} placeholder="votre@email.fr" />
              <InputField label="Téléphone (facultatif)" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="06 xx xx xx xx" />

              {error && (
                <p style={{ color: '#f87171', fontSize: '.875rem', background: 'rgba(248,113,113,.1)', padding: '10px 14px', borderRadius: 8 }}>{error}</p>
              )}

              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.75rem', lineHeight: 1.5 }}>
                En soumettant ce formulaire, vous acceptez d'être contacté par les agences partenaires Terrimo. Vos données sont conservées 3 mois et ne sont pas revendues.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: '13px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,.12)',
                  background: 'transparent', color: 'rgba(255,255,255,.6)', fontWeight: 600, cursor: 'pointer', fontSize: '.9375rem',
                }}
              >← Retour</button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <button
                onClick={() => { if (canNext()) setStep(s => s + 1); }}
                disabled={!canNext()}
                style={{
                  padding: '13px 28px', borderRadius: 12,
                  background: canNext() ? '#0ea5e9' : 'rgba(255,255,255,.08)',
                  color: canNext() ? 'white' : 'rgba(255,255,255,.3)',
                  fontWeight: 700, fontSize: '.9375rem', border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed',
                  transition: 'all .15s',
                }}
              >Continuer →</button>
            ) : (
              <button
                onClick={submit}
                disabled={!canNext() || loading}
                style={{
                  padding: '13px 28px', borderRadius: 12,
                  background: canNext() && !loading ? '#0ea5e9' : 'rgba(255,255,255,.08)',
                  color: canNext() && !loading ? 'white' : 'rgba(255,255,255,.3)',
                  fontWeight: 700, fontSize: '1rem', border: 'none', cursor: canNext() && !loading ? 'pointer' : 'not-allowed',
                }}
              >{loading ? 'Envoi...' : '✅ Activer mon alerte'}</button>
            )}
          </div>
        </div>

        {/* Réassurance */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 28, flexWrap: 'wrap' }}>
          {['🔒 100% gratuit', '📧 Zéro spam', '⏱️ 2 minutes'].map(item => (
            <span key={item} style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8125rem' }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
