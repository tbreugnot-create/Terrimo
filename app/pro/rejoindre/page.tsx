'use client';

import { useState } from 'react';
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
export default function ProRejoindre() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [form, setForm] = useState<FormState>({
    type: '',
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Terri<span className="text-indigo-400">mo</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← Retour à la carte
          </Link>
        </nav>

        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
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
            135 professionnels déjà référencés · Bassin d'Arcachon · Extension France en 2026
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setStep(1)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition text-lg shadow-lg shadow-indigo-900/40"
            >
              Référencer mon activité →
            </button>
            <a
              href="#plans"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-xl transition text-lg"
            >
              Voir les plans
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto px-6 pb-16 grid grid-cols-3 gap-6 text-center">
          {[
            { n: '135', l: 'professionnels référencés' },
            { n: '10',  l: 'communes du Bassin' },
            { n: '∞',   l: 'estimations par mois' },
          ].map(s => (
            <div key={s.n} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="text-4xl font-bold text-indigo-400">{s.n}</div>
              <div className="text-sm text-slate-400 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div id="plans" className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold text-center mb-3">Choisissez votre plan</h2>
          <p className="text-slate-400 text-center mb-10">Sans engagement. Changez de plan à tout moment.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-slate-800 rounded-2xl border-2 ${plan.color} p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className={`self-start text-xs font-bold px-2.5 py-1 rounded-full ${plan.badge} mb-4`}>
                  {plan.name}
                </div>
                <div className="text-3xl font-bold mb-0.5">{plan.price}</div>
                <div className="text-slate-400 text-sm mb-6">{plan.sub}</div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`text-sm ${f.startsWith('❌') ? 'text-slate-500' : 'text-slate-300'}`}>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { set('plan', plan.id); setStep(1); }}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
                    plan.id === 'pro'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-700 py-10 text-center text-slate-500 text-sm">
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
    <div className="min-h-screen bg-slate-50">
      {/* Header formulaire */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          Terri<span className="text-indigo-600">mo</span>
          <span className="ml-2 text-xs font-normal text-slate-500">Espace Pro</span>
        </Link>
        <button
          onClick={() => setStep(step > 1 ? (step - 1) as 0|1|2|3|4|5 : 0)}
          className="text-sm text-slate-500 hover:text-slate-800 transition"
        >
          ← Retour
        </button>
      </nav>

      {/* Progress bar */}
      {step < 5 && (
        <div className="bg-white border-b border-slate-100 px-6 py-3">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Étape {step} / 4</span>
              <span className="text-xs font-medium text-slate-700">{stepTitles[step]}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 py-10">

        {/* ── ÉTAPE 1 : Type d'activité ─────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Votre activité</h2>
              <p className="text-slate-500">Quel type de professionnel êtes-vous ?</p>
            </div>

            <div className="space-y-3">
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => set('type', val as ProType)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition font-medium text-lg ${
                    form.type === val
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              disabled={!form.type}
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Recherche profil ───────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Votre profil</h2>
              <p className="text-slate-500">
                Votre {TYPE_LABELS[form.type]?.toLowerCase()} est peut-être déjà référencé.
                Recherchez pour <strong>revendiquer votre fiche</strong> ou en créer une nouvelle.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={form.searchQuery}
                onChange={e => set('searchQuery', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Nom de votre agence, cabinet…"
                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleSearch}
                disabled={searching || form.searchQuery.trim().length < 2}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl transition font-medium"
              >
                {searching ? '…' : '🔍'}
              </button>
            </div>

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Résultats ({searchResults.length})
                </p>
                {searchResults.map(r => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{r.name}</div>
                      <div className="text-sm text-slate-500">{r.commune}{r.address ? ` · ${r.address}` : ''}</div>
                      {r.is_verified && (
                        <span className="text-xs text-emerald-600 font-medium">✅ Vérifié</span>
                      )}
                    </div>
                    <button
                      onClick={() => claimProfile(r)}
                      className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      C'est moi →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pas trouvé */}
            {searchResults.length === 0 && form.searchQuery.trim().length >= 2 && !searching && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Aucun profil trouvé. Vous pouvez créer une nouvelle fiche.
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={createNew}
                className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-700 font-medium py-3.5 rounded-xl transition"
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
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {form.selectedActeur ? 'Confirmez vos coordonnées' : 'Vos coordonnées'}
              </h2>
              {form.selectedActeur && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm text-indigo-800 mt-2">
                  ✅ Vous revendiquez la fiche <strong>{form.selectedActeur.name}</strong>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom {form.type === 'agence' ? "de l'agence" : form.type === 'notaire' ? "de l'office" : form.type === 'conciergerie' ? 'de la conciergerie' : 'du cabinet'} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900"
                  placeholder="Ex: Century 21 Arcachon"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email pro *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900"
                    placeholder="contact@agence.fr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900"
                    placeholder="05 56 …"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site web</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900"
                  placeholder="https://votre-agence.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commune principale *</label>
                <select
                  value={form.commune}
                  onChange={e => set('commune', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900 bg-white"
                >
                  <option value="">Sélectionnez une commune…</option>
                  {COMMUNES.map(c => (
                    <option key={c.slug} value={c.dvfName}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900"
                  placeholder="12 rue du Maréchal Foch"
                />
              </div>
            </div>

            <button
              disabled={!form.name || !form.email || !form.commune}
              onClick={() => setStep(4)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 4 : Plan + contact ──────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Votre plan</h2>
              <p className="text-slate-500">Choisissez votre formule. Sans engagement.</p>
            </div>

            {/* Sélecteur de plan compact */}
            <div className="space-y-3">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => set('plan', plan.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition ${
                    form.plan === plan.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${plan.badge}`}>
                        {plan.name}
                      </span>
                      <span className="text-sm text-slate-600">{plan.features.filter(f => !f.startsWith('❌')).length} fonctionnalités</span>
                    </div>
                    <span className="font-bold text-slate-900">{plan.price}<span className="text-xs text-slate-400 font-normal"> {plan.sub}</span></span>
                  </div>
                </button>
              ))}
            </div>

            {/* Contact */}
            <div className="bg-slate-100 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-semibold text-slate-700">👤 Votre contact chez Terrimo</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={form.contact_prenom}
                    onChange={e => set('contact_prenom', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-900"
                    placeholder="Thomas"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.contact_nom}
                    onChange={e => set('contact_nom', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-900"
                    placeholder="Dupont"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Poste</label>
                <input
                  type="text"
                  value={form.contact_poste}
                  onChange={e => set('contact_poste', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-900"
                  placeholder="Directeur, Négociateur, …"
                />
              </div>
            </div>

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cgu}
                onChange={e => set('cgu', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-indigo-600"
              />
              <span className="text-sm text-slate-600">
                J'accepte les{' '}
                <a href="/cgu" className="text-indigo-600 underline" target="_blank">CGU Terrimo</a>
                {' '}et la{' '}
                <a href="/confidentialite" className="text-indigo-600 underline" target="_blank">politique de confidentialité</a>.
              </span>
            </label>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                ❌ {submitError}
              </div>
            )}

            <button
              disabled={!form.contact_prenom || !form.contact_nom || !form.cgu || submitting}
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
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
          <div className="text-center space-y-6 py-10">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-slate-900">Bienvenue sur Terrimo !</h2>
            <p className="text-slate-600 max-w-sm mx-auto">
              Votre fiche <strong>{form.name}</strong> est en cours de validation.
              Vous recevrez un email de confirmation à <strong>{form.email}</strong> sous 24h.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-left max-w-sm mx-auto">
              <p className="text-sm font-semibold text-indigo-900 mb-3">Récapitulatif</p>
              <div className="space-y-1.5 text-sm text-indigo-800">
                <div>🏢 {form.name}</div>
                <div>📍 {form.commune}</div>
                <div>📋 Plan : <strong>{form.plan.toUpperCase()}</strong></div>
                <div>📧 {form.email}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link
                href="/"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition text-center"
              >
                Voir la carte →
              </Link>
              <Link
                href="/evaluer"
                className="border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-3 rounded-xl transition text-center"
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
