'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COMMUNES } from '@/lib/communes';

// ============================================================
// TYPES
// ============================================================
interface FormData {
  // Étape 1
  commune: string;
  commune_dvf: string;
  type_local: 'Maison' | 'Appartement' | '';
  // Étape 2
  surface: string;
  pieces: string;
  annee_construction: string;
  dpe: string;
  has_piscine: boolean;
  garages: string;
  // Étape 3 — Critères Bassin
  distance_mer: string;
  vue_mer: boolean;
  front_de_mer: boolean;
  // Étape 4 — Subjectifs
  etat_general: string;
  luminosite: number;
  nuisances: number;
  vis_a_vis: number;
  standing: number;
  charme: number;
  finitions: number;
}

interface EstimationResult {
  prix_m2_base: number;
  prix_m2_final: number;
  estimation_min: number;
  estimation_centrale: number;
  estimation_max: number;
  surface: number;
  commune: string;
  type_local: string;
  nb_transactions: number;
  source: 'dvf' | 'fallback';
  coefficients: {
    dpe: number;
    etat: number;
    vue_mer: number;
    distance_mer: number;
    piscine: number;
    subjectif: number;
  };
}

interface LeadForm {
  name: string;
  email: string;
  phone: string;
}

// ============================================================
// UTILS
// ============================================================
const formatPrix = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const formatM2 = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €/m²';

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i + 1 < current
                ? 'bg-indigo-600 text-white'
                : i + 1 === current
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 ${i + 1 < current ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-gray-500">Étape {current} sur {total}</span>
    </div>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  const labels = ['', minLabel, '', '', '', maxLabel];
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-indigo-600">
          {labels[value] || `${value}/5`}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function EvaluerPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: '', email: '', phone: '' });
  const [leadLoading, setLeadLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    commune: '',
    commune_dvf: '',
    type_local: '',
    surface: '',
    pieces: '',
    annee_construction: '',
    dpe: 'D',
    has_piscine: false,
    garages: '0',
    distance_mer: '',
    vue_mer: false,
    front_de_mer: false,
    etat_general: 'bon',
    luminosite: 3,
    nuisances: 3,
    vis_a_vis: 3,
    standing: 3,
    charme: 3,
    finitions: 3,
  });

  const updateForm = (key: keyof FormData, value: FormData[keyof FormData]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // --------------------------------------------------------
  // Soumission estimation
  // --------------------------------------------------------
  const handleEstimer = async () => {
    setLoading(true);
    try {
      const payload = {
        commune: form.commune_dvf,
        type_local: form.type_local,
        surface: parseInt(form.surface),
        pieces: form.pieces ? parseInt(form.pieces) : undefined,
        annee_construction: form.annee_construction ? parseInt(form.annee_construction) : undefined,
        dpe: form.dpe,
        has_piscine: form.has_piscine,
        garages: parseInt(form.garages) || 0,
        distance_mer: form.distance_mer ? parseInt(form.distance_mer) : undefined,
        vue_mer: form.vue_mer,
        front_de_mer: form.front_de_mer,
        etat_general: form.etat_general,
        luminosite: form.luminosite,
        nuisances: form.nuisances,
        vis_a_vis: form.vis_a_vis,
        standing: form.standing,
        charme: form.charme,
        finitions: form.finitions,
      };

      const res = await fetch('/api/evaluer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      setResult(data);
      setStep(5);
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // Soumission lead agence
  // --------------------------------------------------------
  const handleLeadSubmit = async () => {
    if (!result || !leadForm.name || !leadForm.email) return;
    setLeadLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          commune: form.commune,
          source: 'evaluer',
          message: `Estimation bien: ${form.type_local} ${form.surface}m² à ${form.commune}. Fourchette: ${formatPrix(result.estimation_min)} – ${formatPrix(result.estimation_max)}`,
        }),
      });
      setLeadSent(true);
      setShowLeadForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLeadLoading(false);
    }
  };

  // ============================================================
  // ÉTAPE 1 — Commune & Type
  // ============================================================
  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre bien</h2>
      <p className="text-gray-500 mb-8">Commençons par localiser et identifier votre bien.</p>

      <div className="space-y-6">
        {/* Commune */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Commune</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMMUNES.map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  updateForm('commune', c.name);
                  updateForm('commune_dvf', c.dvfName);
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.commune === c.name
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="text-lg mb-0.5">{c.tierEmoji}</div>
                <div className="font-medium text-sm text-gray-900 leading-tight">{c.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Type de bien</label>
          <div className="grid grid-cols-2 gap-4">
            {(['Maison', 'Appartement'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateForm('type_local', t)}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  form.type_local === t
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">{t === 'Maison' ? '🏡' : '🏢'}</div>
                <div className="font-semibold text-gray-900">{t}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => setStep(2)}
          disabled={!form.commune || !form.type_local}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuer →
        </button>
      </div>
    </div>
  );

  // ============================================================
  // ÉTAPE 2 — Caractéristiques
  // ============================================================
  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Caractéristiques</h2>
      <p className="text-gray-500 mb-8">Les données objectives de votre bien.</p>

      <div className="space-y-5">
        {/* Surface */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Surface habitable *</label>
            <div className="relative">
              <input
                type="number"
                value={form.surface}
                onChange={(e) => updateForm('surface', e.target.value)}
                placeholder="120"
                min={10}
                max={2000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none pr-12"
              />
              <span className="absolute right-4 top-3.5 text-gray-400 text-sm">m²</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nb de pièces</label>
            <input
              type="number"
              value={form.pieces}
              onChange={(e) => updateForm('pieces', e.target.value)}
              placeholder="5"
              min={1}
              max={20}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Année construction */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Année de construction</label>
          <input
            type="number"
            value={form.annee_construction}
            onChange={(e) => updateForm('annee_construction', e.target.value)}
            placeholder="1985"
            min={1800}
            max={2025}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* DPE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Diagnostic de Performance Énergétique (DPE)
          </label>
          <div className="flex gap-2">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((d) => {
              const colors: Record<string, string> = {
                A: 'bg-green-500', B: 'bg-green-400', C: 'bg-lime-400',
                D: 'bg-yellow-400', E: 'bg-orange-400', F: 'bg-red-400', G: 'bg-red-600',
              };
              return (
                <button
                  key={d}
                  onClick={() => updateForm('dpe', d)}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                    form.dpe === d
                      ? `${colors[d]} text-white ring-2 ring-offset-2 ring-gray-400 scale-105`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">Impact fort sur la valeur depuis 2022 (réglementation RE2020)</p>
        </div>

        {/* Piscine & Garage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Piscine</label>
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => updateForm('has_piscine', v)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.has_piscine === v
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {v ? '✓ Oui' : '✗ Non'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Garages / Parkings</label>
            <input
              type="number"
              value={form.garages}
              onChange={(e) => updateForm('garages', e.target.value)}
              min={0}
              max={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!form.surface || parseInt(form.surface) < 10}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuer →
        </button>
      </div>
    </div>
  );

  // ============================================================
  // ÉTAPE 3 — Critères Bassin d'Arcachon
  // ============================================================
  const renderStep3 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Situation géographique</h2>
      <p className="text-gray-500 mb-8">
        Ces critères ont un impact très fort sur les prix du Bassin d'Arcachon.
      </p>

      <div className="space-y-6">
        {/* Distance mer */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Distance à la mer / au bassin
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Bord de mer', value: '100', icon: '🏖️', note: '+25%' },
              { label: '< 500 m', value: '400', icon: '🌊', note: '+15%' },
              { label: '500 m – 1 km', value: '750', icon: '🌴', note: '+5%' },
              { label: '1 – 2 km', value: '1500', icon: '🏘️', note: 'neutre' },
              { label: '> 2 km', value: '3000', icon: '🌲', note: '-5%' },
              { label: 'Je ne sais pas', value: '', icon: '❓', note: '' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateForm('distance_mer', opt.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.distance_mer === opt.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="text-xl mb-1">{opt.icon}</div>
                <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                {opt.note && (
                  <div className={`text-xs mt-0.5 font-semibold ${opt.note.startsWith('+') ? 'text-green-600' : opt.note === 'neutre' ? 'text-gray-400' : 'text-orange-500'}`}>
                    {opt.note}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vue mer */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Vue sur la mer / le bassin</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Vue directe mer/bassin', vue: true, front: false, icon: '🔭', note: '+20%' },
              { label: 'Front de mer / 1ère ligne', vue: true, front: true, icon: '⭐', note: '+30%' },
              { label: 'Pas de vue mer', vue: false, front: false, icon: '🏠', note: '' },
            ].map((opt) => (
              <button
                key={`${opt.vue}-${opt.front}`}
                onClick={() => {
                  updateForm('vue_mer', opt.vue);
                  updateForm('front_de_mer', opt.front);
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.vue_mer === opt.vue && form.front_de_mer === opt.front
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="text-xl mb-1">{opt.icon}</div>
                <div className="text-sm font-medium text-gray-900 leading-tight">{opt.label}</div>
                {opt.note && (
                  <div className="text-xs mt-1 font-semibold text-green-600">{opt.note}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Continuer →
        </button>
      </div>
    </div>
  );

  // ============================================================
  // ÉTAPE 4 — Critères subjectifs
  // ============================================================
  const renderStep4 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Qualité du bien</h2>
      <p className="text-gray-500 mb-8">
        Votre appréciation personnelle affine l'estimation. Soyez objectif !
      </p>

      <div className="space-y-6">
        {/* État général */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">État général du bien</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Neuf / Récent', value: 'neuf', icon: '✨', note: '+10%' },
              { label: 'Bon état', value: 'bon', icon: '👍', note: '+2%' },
              { label: 'Travaux légers', value: 'travaux', icon: '🔧', note: '-10%' },
              { label: 'À rénover', value: 'renover', icon: '🏗️', note: '-18%' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateForm('etat_general', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.etat_general === opt.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                <div className={`text-xs mt-0.5 font-medium ${opt.note.startsWith('+') ? 'text-green-600' : 'text-orange-500'}`}>
                  {opt.note} sur la valeur
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-5 bg-gray-50 rounded-2xl p-5">
          <p className="text-sm text-gray-500 font-medium">Notez votre bien de 1 (faible) à 5 (excellent)</p>

          <SliderInput
            label="Luminosité & exposition"
            value={form.luminosite}
            onChange={(v) => updateForm('luminosite', v)}
            minLabel="Sombre"
            maxLabel="Très lumineux"
          />
          <SliderInput
            label="Nuisances (bruit, circulation)"
            value={form.nuisances}
            onChange={(v) => updateForm('nuisances', v)}
            minLabel="Très bruyant"
            maxLabel="Calme total"
          />
          <SliderInput
            label="Intimité & vis-à-vis"
            value={form.vis_a_vis}
            onChange={(v) => updateForm('vis_a_vis', v)}
            minLabel="Très exposé"
            maxLabel="Très intime"
          />
          {form.type_local === 'Appartement' && (
            <SliderInput
              label="Standing de la résidence"
              value={form.standing}
              onChange={(v) => updateForm('standing', v)}
              minLabel="Standard"
              maxLabel="Standing élevé"
            />
          )}
          <SliderInput
            label="Charme & cachet architectural"
            value={form.charme}
            onChange={(v) => updateForm('charme', v)}
            minLabel="Ordinaire"
            maxLabel="Exceptionnel"
          />
          <SliderInput
            label="Qualité des finitions"
            value={form.finitions}
            onChange={(v) => updateForm('finitions', v)}
            minLabel="À améliorer"
            maxLabel="Très soigné"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={handleEstimer}
          disabled={loading}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Calcul en cours…
            </span>
          ) : 'Estimer mon bien 🏡'}
        </button>
      </div>
    </div>
  );

  // ============================================================
  // ÉTAPE 5 — RÉSULTAT
  // ============================================================
  const renderResult = () => {
    if (!result) return null;

    const coefImpact = Object.entries(result.coefficients)
      .filter(([, v]) => v !== 1.0)
      .map(([k, v]) => {
        const labels: Record<string, string> = {
          dpe: `DPE ${form.dpe}`,
          etat: 'État général',
          vue_mer: 'Vue mer',
          distance_mer: 'Distance mer',
          piscine: 'Piscine',
          subjectif: 'Qualité subjective',
        };
        const pct = Math.round((v - 1) * 100);
        return { label: labels[k] || k, pct };
      })
      .filter((c) => c.pct !== 0);

    return (
      <div className="space-y-8">
        {/* En-tête résultat */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏡</span>
            <h2 className="text-2xl font-bold text-gray-900">Votre estimation</h2>
          </div>
          <p className="text-gray-500">
            {result.type_local} · {result.surface} m² · {form.commune}
            {result.source === 'dvf' && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                ✓ Basé sur {result.nb_transactions} transactions DVF réelles
              </span>
            )}
          </p>
        </div>

        {/* Fourchette */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1 font-medium">Fourchette d'estimation</p>
          <div className="flex items-end gap-4 mb-4">
            <div className="text-left">
              <div className="text-sm text-gray-500">Min</div>
              <div className="text-xl font-bold text-gray-700">{formatPrix(result.estimation_min)}</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs text-indigo-600 font-semibold mb-1">VALEUR ESTIMÉE</div>
              <div className="text-4xl font-black text-indigo-700">{formatPrix(result.estimation_centrale)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Max</div>
              <div className="text-xl font-bold text-gray-700">{formatPrix(result.estimation_max)}</div>
            </div>
          </div>

          {/* Barre graphique */}
          <div className="relative h-3 bg-indigo-100 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-300 rounded-full" />
          </div>

          <div className="flex justify-between mt-3">
            <div className="text-sm text-gray-600">
              Prix au m² : <span className="font-semibold text-indigo-700">{formatM2(result.prix_m2_final)}</span>
            </div>
            <div className="text-xs text-gray-400">
              Base marché : {formatM2(result.prix_m2_base)}
            </div>
          </div>
        </div>

        {/* Détail coefficients */}
        {coefImpact.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Impact des critères sur votre estimation</h3>
            <div className="space-y-2">
              {coefImpact.map((c) => (
                <div key={c.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{c.label}</span>
                  <span className={`text-sm font-semibold ${c.pct > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {c.pct > 0 ? '+' : ''}{c.pct}%
                  </span>
                </div>
              ))}
            </div>
            {result.source === 'fallback' && (
              <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ Estimation basée sur les prix de marché 2024. Pour une précision maximale, les données DVF seront bientôt disponibles.
              </p>
            )}
          </div>
        )}

        {/* CTA — Avis d'agence */}
        <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🏆</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Obtenez l'avis d'une agence locale</h3>
              <p className="text-gray-300 text-sm mb-4">
                Une agence premium du Bassin vous contacte pour affiner cette estimation avec une visite de votre bien. Gratuit et sans engagement.
              </p>

              {leadSent ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-300 font-semibold">✓ Votre demande a bien été envoyée !</p>
                  <p className="text-green-300/70 text-sm mt-1">Une agence vous contactera dans les 24h.</p>
                </div>
              ) : showLeadForm ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone (optionnel)"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLeadForm(false)}
                      className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/5"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleLeadSubmit}
                      disabled={leadLoading || !leadForm.name || !leadForm.email}
                      className="flex-1 py-3 bg-white text-indigo-900 rounded-xl font-semibold text-sm hover:bg-indigo-50 disabled:opacity-50"
                    >
                      {leadLoading ? 'Envoi…' : 'Envoyer'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="w-full py-4 bg-white text-indigo-900 rounded-xl font-bold text-base hover:bg-indigo-50 transition-colors"
                >
                  Recevoir l'avis d'une agence →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep(1);
              setResult(null);
              setLeadSent(false);
              setShowLeadForm(false);
            }}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Recommencer
          </button>
          <Link
            href="/"
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium text-center hover:bg-gray-800"
          >
            Explorer la carte →
          </Link>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================
  const stepLabels = ['Bien', 'Caractéristiques', 'Localisation', 'Qualité'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-indigo-600 text-lg">Terrimo</Link>
          <span className="text-sm text-gray-400 hidden sm:block">Évaluer mon bien</span>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Carte
        </Link>
      </header>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        {step === 1 && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span>🏡</span> Estimation gratuite & instantanée
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Combien vaut votre bien<br/>sur le Bassin d'Arcachon ?
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Basé sur les données DVF officielles + critères terrain propres au Bassin.
              Résultat en 2 minutes.
            </p>
          </div>
        )}

        {/* Card formulaire */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step < 5 && <StepIndicator current={step} total={4} />}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderResult()}
        </div>

        {/* Bandeau confiance */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
            <span>🔒 Données confidentielles</span>
            <span>📊 Source : DVF data.gouv.fr</span>
            <span>⚡ Résultat instantané</span>
          </div>
        )}
      </div>
    </div>
  );
}
