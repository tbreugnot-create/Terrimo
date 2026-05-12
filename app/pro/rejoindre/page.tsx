'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { COMMUNES } from '@/lib/communes';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type ProType = 'agence' | 'notaire' | 'diagnostiqueur' | 'conciergerie' | '';
type Plan    = 'free' | 'pro' | 'premium';

interface SearchResult {
  id: number;
  name: string;
  commune: string;
  address: string;
  phone: string;
  email: string;
  plan: string;
  is_verified: boolean;
}

interface FormState {
  // Étape 1
  type: ProType;
  // Étape 2 — recherche
  searchQuery: string;
  selectedActeur: SearchResult | null;
  isNewProfile: boolean;
  // Étape 3 — infos
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  commune: string;
  // Étape 4 — plan + contact
  plan: Plan;
  contact_nom: string;
  contact_prenom: string;
  contact_poste: string;
  // Acceptation
  cgu: boolean;
}

// ─────────────────────────────────────────────────────────────
// PLANS CONFIG
// ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free' as Plan,
    name: 'Free',
    price: 'Gratuit',
    sub: 'pour toujours',
    color: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-600',
    cta: 'Commencer gratuitement',
    features: [
      '✅ Fiche visible sur la carte',
      '✅ Coordonnées publiques (tél, email)',
      '✅ Badge "Présent sur Terrimo"',
      '✅ 1 commune de couverture',
      '❌ Mise en avant sur la carte',
      '❌ Réception des leads estimations',
      '❌ Statistiques de visibilité',
    ],
  },
  {
    id: 'pro' as Plan,
    name: 'Pro',
    price: '49 €',
    sub: '/ mois HT',
    color: 'border-indigo-400 ring-2 ring-indigo-300',
    badge: 'bg-indigo-600 text-white',
    popular: true,
    cta: 'Démarrer en Pro',
    features: [
      '✅ Tout le plan Free',
      '✅ Marqueur agrandi sur la carte',
      '✅ Badge Pro visible',
      '✅ Jusqu\'à 3 communes',
      '✅ Leads des estimations Terrimo',
      '✅ Stats de vues de votre fiche',
      '❌ Position prioritaire',
    ],
  },
  {
    id: 'premium' as Plan,
    name: 'Premium',
    price: '149 €',
    sub: '/ mois HT',
    color: 'border-amber-400',
    badge: 'bg-amber-500 text-white',
    cta: 'Passer en Premium',
    features: [
      '✅ Tout le plan Pro',
      '✅ Position prioritaire sur la carte',
      '✅ Badge Premium doré',
      '✅ Communes illimitées',
      '✅ Tous les leads en temps réel',
      '✅ CRM intégré (suivi prospects)',
      '✅ Support prioritaire',
    ],
  },
];

const TYPE_LABELS: Record<string, string> = {
  agence:         '🏢 Agence immobilière',
  notaire:        '⚖️ Office notarial',
  diagnostiqueur: '🔬 Cabinet de diagnostic',
  conciergerie:   '🏡 Conciergerie',
};

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
function ProRejoindreInner() {
  const searchParams = useSearchParams();
  const typeParam = (searchParams.get('type') ?? '') as ProType;
  const validTypes: ProType[] = ['agence', 'notaire', 'diagnostiqueur', 'conciergerie'];
  const initialType: ProType = validTypes.includes(typeParam) ? typeParam : '';

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(initialType ? 1 : 0);
  const [form, setForm] = useState<FormState>({
    type: initialType,
    searchQuery: '',
    selectedActeur: null,
    isNewProfile: false,
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    commune: '',
    plan: 'free',
    contact_nom: '',
    contact_prenom: '',
    contact_poste: '',
    cgu: false,
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [liveActeurs, setLiveActeurs] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setLiveActeurs(d.acteurs)).catch(() => {});
  }, []);

  const set = (k: keyof FormState, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  // ── Recherche profil existant ──────────────────────────────
  const handleSearch = async () => {
    if (form.searchQuery.trim().length < 2) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `/api/pro/search?q=${encodeURIComponent(form.searchQuery)}&type=${form.type}`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const claimProfile = (acteur: SearchResult) => {
    set('selectedActeur', acteur);
    set('isNewProfile', false);
    set('name',    acteur.name);
    set('email',   acteur.email || '');
    set('phone',   acteur.phone || '');
    set('commune', acteur.commune || '');
    set('address', acteur.address || '');
    setStep(3);
  };

  const createNew = () => {
    set('isNewProfile', true);
    set('selectedActeur', null);
    if (form.searchQuery.trim()) set('name', form.searchQuery.trim());
    setStep(3);
  };

  // ── Soumission finale ──────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/pro/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:           form.type,
          name:           form.name,
          email:          form.email,
          phone:          form.phone,
          website:        form.website,
          address:        form.address,
          commune:        form.commune,
          plan:           form.plan,
          contact_nom:    form.contact_nom,
          contact_prenom: form.contact_prenom,
          contact_poste:  form.contact_poste,
          existing_id:    form.selectedActeur?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setSubmitSuccess(true);
      setStep(5);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // RENDU — LANDING (step 0)
  // ─────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)', color: 'white' }}>

        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
            🏡 Pour les professionnels de l'immobilier
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Soyez visible là où<br />
            <span className="text-indigo-400">les acquéreurs cherchent</span>
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Terrimo est la carte interactive de référence du Bassin d'Arcachon.
            Agences, notaires, diagnostiqueurs et conciergeries — rejoignez la plateforme et recevez des leads qualifiés.
          </p>
          <p className="text-slate-400 mb-10 text-sm">
            {liveActeurs ?? 135}+ professionnels déjà référencés · Bassin d&apos;Arcachon · Extension France en 2026
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setStep(1)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition text-lg shadow-lg shadow-indigo-900/40"
            >
              Référencer mon activité →
            </button>
            <Link
              href="/tarifs"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-xl transition text-lg"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto px-6 pb-16 grid grid-cols-3 gap-6 text-center">
          {[
            { n: `${liveActeurs ?? 135}+`, l: 'professionnels référencés' },
            { n: '12',  l: 'communes du Bassin' },
            { n: '∞',   l: 'estimations par mois' },
          ].map(s => (
            <div key={s.n} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }} className="rounded-2xl p-6">
              <div className="text-4xl font-bold text-indigo-400">{s.n}</div>
              <div style={{ color: 'rgba(255,255,255,.4)' }} className="text-sm mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tarifs CTA */}
        <div className="max-w-3xl mx-auto px-6 pb-20">
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)' }} className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-lg font-bold mb-1">Free · Pro 49 €/mois · Premium 149 €/mois</div>
              <p className="text-slate-400 text-sm">Sans engagement. Changez de plan à tout moment. Démarrez gratuitement.</p>
            </div>
            <Link
              href="/tarifs"
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition text-sm whitespace-nowrap"
            >
              Voir tous les tarifs →
            </Link>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.35)' }} className="py-10 text-center text-sm">
          Des questions ?{' '}
          <a href="mailto:pro@terrimo.homes" className="text-indigo-400 hover:underline">
            pro@terrimo.homes
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // FORMULAIRE MULTI-ÉTAPES (steps 1–4)
  // ─────────────────────────────────────────────────────────
  const stepTitles = [
    '',
    'Votre activité',
    'Votre profil',
    'Vos coordonnées',
    'Votre plan',
  ];

  return (
    <div style={{ background: '#0a1628', minHeight: 'calc(100dvh - 68px)' }}>

      {/* Progress bar */}
      {step < 5 && (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '12px 24px' }}>
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setStep(step > 1 ? (step - 1) as 0|1|2|3|4|5 : 0)}
                style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Retour
              </button>
              <span style={{ fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>{stepTitles[step]}</span>
              <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)' }}>Étape {step} / 4</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                  borderRadius: 4,
                  transition: 'width .3s ease',
                  width: `${(step / 4) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 py-10" style={{ color: 'white' }}>

        {/* ── ÉTAPE 1 : Type d'activité ─────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'white' }}>Votre activité</h2>
              <p style={{ color: 'rgba(255,255,255,.45)' }}>Quel type de professionnel êtes-vous ?</p>
            </div>

            <div className="space-y-3">
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => set('type', val as ProType)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px',
                    borderRadius: 14, border: '2px solid',
                    borderColor: form.type === val ? '#6366f1' : 'rgba(255,255,255,.1)',
                    background: form.type === val ? 'rgba(99,102,241,.15)' : 'rgba(255,255,255,.03)',
                    color: 'white', fontWeight: 600, fontSize: '1.0625rem',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              disabled={!form.type}
              onClick={() => setStep(2)}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: 'pointer', opacity: form.type ? 1 : 0.4,
              }}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Recherche profil ───────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'white' }}>Votre profil</h2>
              <p style={{ color: 'rgba(255,255,255,.45)' }}>
                Votre {TYPE_LABELS[form.type]?.toLowerCase()} est peut-être déjà référencé.
                Recherchez pour <strong>revendiquer votre fiche</strong> ou en créer une nouvelle.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={form.searchQuery}
                onChange={e => set('searchQuery', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Nom de votre agence, cabinet…"
                style={{
                  flex: 1, border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 14, padding: '12px 16px',
                  background: 'rgba(255,255,255,.06)', color: 'white',
                  fontSize: '.9375rem', outline: 'none',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searching || form.searchQuery.trim().length < 2}
                style={{
                  padding: '12px 20px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '1rem',
                  opacity: searching || form.searchQuery.trim().length < 2 ? 0.4 : 1,
                }}
              >
                {searching ? '…' : '🔍'}
              </button>
            </div>

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Résultats ({searchResults.length})
                </p>
                {searchResults.map(r => (
                  <div key={r.id} style={{
                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 14, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                      <div style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{r.commune}{r.address ? ` · ${r.address}` : ''}</div>
                      {r.is_verified && <span style={{ fontSize: '.75rem', color: '#6ee7b7', fontWeight: 600 }}>✅ Vérifié</span>}
                    </div>
                    <button
                      onClick={() => claimProfile(r)}
                      style={{
                        flexShrink: 0, padding: '8px 16px', borderRadius: 10,
                        background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)',
                        color: '#a5b4fc', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer',
                      }}
                    >
                      C'est moi →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pas trouvé */}
            {searchResults.length === 0 && form.searchQuery.trim().length >= 2 && !searching && (
              <div style={{
                background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
                borderRadius: 14, padding: '14px 16px', fontSize: '.875rem', color: '#fcd34d',
              }}>
                Aucun profil trouvé. Vous pouvez créer une nouvelle fiche.
              </div>
            )}

            <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <button
                onClick={createNew}
                style={{
                  width: '100%', border: '2px dashed rgba(255,255,255,.15)',
                  color: 'rgba(255,255,255,.5)', fontWeight: 600,
                  padding: '14px', borderRadius: 14, background: 'transparent',
                  cursor: 'pointer', fontSize: '1rem', transition: 'all .15s',
                }}
              >
                + Créer une nouvelle fiche
              </button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Coordonnées ─────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'white' }}>
                {form.selectedActeur ? 'Confirmez vos coordonnées' : 'Vos coordonnées'}
              </h2>
              {form.selectedActeur && (
                <div style={{ background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.3)', borderRadius: 12, padding: '10px 16px', fontSize: '.875rem', color: '#a5b4fc', marginTop: 8 }}>
                  ✅ Vous revendiquez la fiche <strong>{form.selectedActeur.name}</strong>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: `Nom ${form.type === 'agence' ? "de l'agence" : form.type === 'notaire' ? "de l'office" : form.type === 'conciergerie' ? 'de la conciergerie' : 'du cabinet'} *`, type: 'text', key: 'name' as const, placeholder: 'Ex: Century 21 Arcachon' },
                { label: 'Site web', type: 'url', key: 'website' as const, placeholder: 'https://votre-agence.fr' },
                { label: 'Adresse', type: 'text', key: 'address' as const, placeholder: '12 rue du Maréchal Foch' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key] as string}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', border: '1px solid rgba(255,255,255,.12)',
                      borderRadius: 12, padding: '12px 16px',
                      background: 'rgba(255,255,255,.06)', color: 'white',
                      fontSize: '.9375rem', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Email pro *', type: 'email', key: 'email' as const, placeholder: 'contact@agence.fr' },
                  { label: 'Téléphone', type: 'tel', key: 'phone' as const, placeholder: '05 56 …' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key] as string}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', border: '1px solid rgba(255,255,255,.12)',
                        borderRadius: 12, padding: '12px 16px',
                        background: 'rgba(255,255,255,.06)', color: 'white',
                        fontSize: '.9375rem', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>Commune principale *</label>
                <select
                  value={form.commune}
                  onChange={e => set('commune', e.target.value)}
                  style={{
                    width: '100%', border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 12, padding: '12px 16px',
                    background: '#0f2035', color: 'white',
                    fontSize: '.9375rem', outline: 'none', boxSizing: 'border-box' as const,
                  }}
                >
                  <option value="">Sélectionnez une commune…</option>
                  {COMMUNES.map(c => (
                    <option key={c.slug} value={c.dvfName}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              disabled={!form.name || !form.email || !form.commune}
              onClick={() => setStep(4)}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: 'pointer',
                opacity: !form.name || !form.email || !form.commune ? 0.4 : 1,
              }}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 4 : Plan + contact ──────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'white' }}>Votre plan</h2>
              <p style={{ color: 'rgba(255,255,255,.45)' }}>Choisissez votre formule. Sans engagement.</p>
            </div>

            {/* Sélecteur de plan compact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => set('plan', plan.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px',
                    borderRadius: 16, border: '2px solid',
                    borderColor: form.plan === plan.id ? '#6366f1' : 'rgba(255,255,255,.1)',
                    background: form.plan === plan.id ? 'rgba(99,102,241,.12)' : 'rgba(255,255,255,.03)',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {/* En-tête plan */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${plan.badge}`}>
                        {plan.name}
                      </span>
                      {'popular' in plan && plan.popular && (
                        <span style={{ fontSize: '.75rem', color: '#a5b4fc', fontWeight: 600 }}>⭐ Le plus choisi</span>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '1.0625rem' }}>
                      {plan.price}
                      <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', fontWeight: 400, marginLeft: 4 }}>{plan.sub}</span>
                    </span>
                  </div>
                  {/* Features */}
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0, padding: 0, listStyle: 'none' }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{
                        fontSize: '.8125rem',
                        color: f.startsWith('❌') ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.65)',
                        textDecoration: f.startsWith('❌') ? 'line-through' : 'none',
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                      }}>
                        <span style={{ flexShrink: 0, marginTop: 1 }}>{f.slice(0, 2)}</span>
                        <span>{f.slice(2).trim()}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {/* Contact */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: '20px' }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>👤 Qui gère ce compte ?</p>
                <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.35)', margin: 0 }}>Le responsable au sein de votre structure — c'est lui que nous contacterons.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Prénom *', key: 'contact_prenom' as const, placeholder: 'Thomas' },
                  { label: 'Nom *', key: 'contact_nom' as const, placeholder: 'Dupont' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '.75rem', color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{f.label}</label>
                    <input
                      type="text"
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', border: '1px solid rgba(255,255,255,.12)',
                        borderRadius: 10, padding: '10px 14px',
                        background: 'rgba(255,255,255,.06)', color: 'white',
                        fontSize: '.875rem', outline: 'none', boxSizing: 'border-box' as const,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.75rem', color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Poste</label>
                <input
                  type="text"
                  value={form.contact_poste}
                  onChange={e => set('contact_poste', e.target.value)}
                  placeholder="Directeur, Négociateur, …"
                  style={{
                    width: '100%', border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 10, padding: '10px 14px',
                    background: 'rgba(255,255,255,.06)', color: 'white',
                    fontSize: '.875rem', outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>
            </div>

            {/* CGU */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.cgu}
                onChange={e => set('cgu', e.target.checked)}
                style={{ marginTop: 2, accentColor: '#6366f1', width: 16, height: 16, flexShrink: 0 }}
              />
              <span style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                J'accepte les{' '}
                <a href="/cgu" style={{ color: '#a5b4fc', textDecoration: 'underline' }} target="_blank">CGU Terrimo</a>
                {' '}et la{' '}
                <a href="/confidentialite" style={{ color: '#a5b4fc', textDecoration: 'underline' }} target="_blank">politique de confidentialité</a>.
              </span>
            </label>

            {submitError && (
              <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 14, padding: '12px 16px', fontSize: '.875rem' }}>
                ❌ {submitError}
              </div>
            )}

            <button
              disabled={!form.contact_prenom || !form.contact_nom || !form.cgu || submitting}
              onClick={handleSubmit}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: !form.contact_prenom || !form.contact_nom || !form.cgu || submitting ? 0.4 : 1,
              }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Inscription en cours…
                </>
              ) : (
                '🚀 Rejoindre Terrimo'
              )}
            </button>
          </div>
        )}

        {/* ── ÉTAPE 5 : Confirmation ─────────────────────────── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <div style={{ fontSize: '4rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', margin: 0 }}>Bienvenue sur Terrimo !</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', maxWidth: 340, lineHeight: 1.65, margin: 0 }}>
              Votre fiche <strong style={{ color: 'white' }}>{form.name}</strong> est en cours de validation.
              Vous recevrez un email de confirmation à <strong style={{ color: 'white' }}>{form.email}</strong> sous 24h.
            </p>
            <div style={{
              background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)',
              borderRadius: 16, padding: 20, textAlign: 'left', maxWidth: 340, width: '100%',
            }}>
              <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#a5b4fc', marginBottom: 12, marginTop: 0 }}>Récapitulatif</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '.875rem', color: 'rgba(255,255,255,.65)' }}>
                <div>🏢 {form.name}</div>
                <div>📍 {form.commune}</div>
                <div>📋 Plan : <strong style={{ color: 'white' }}>{form.plan.toUpperCase()}</strong></div>
                <div>📧 {form.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, width: '100%' }}>
              <Link
                href="/"
                style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', fontWeight: 700, fontSize: '1rem',
                  borderRadius: 14, textDecoration: 'none',
                }}
              >
                Voir la carte →
              </Link>
              <Link
                href="/evaluer"
                style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  border: '1px solid rgba(255,255,255,.12)',
                  color: 'rgba(255,255,255,.6)', fontWeight: 600, fontSize: '.9375rem',
                  borderRadius: 14, textDecoration: 'none',
                }}
              >
                Tester l'estimation
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProRejoindre() {
  return (
    <Suspense fallback={null}>
      <ProRejoindreInner />
    </Suspense>
  );
}
