'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const COMMUNES = [
  'Arcachon', 'La Teste-de-Buch', 'Gujan-Mestras', 'Lège-Cap-Ferret',
  'Andernos-les-Bains', 'Arès', 'Lanton', 'Audenge', 'Biganos', 'Mios',
];

const TYPES_BIEN = ['Maison', 'Appartement', 'Terrain', 'Commerce', 'Immeuble', 'Autre'];
const TYPES_ANNONCE = [
  { value: 'vente',    label: '💰 Vente' },
  { value: 'location', label: '🔑 Location' },
  { value: 'viager',   label: '🕰 Viager' },
  { value: 'neuf',     label: '🏗 Neuf' },
];
const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n);

export default function NouveauBienPage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();

  const [form, setForm] = useState({
    type_annonce: 'vente',
    type_bien: 'Maison',
    titre: '',
    prix: '',
    surface: '',
    surface_terrain: '',
    pieces: '',
    chambres: '',
    sdb: '',
    dpe: '',
    annee_construction: '',
    commune: '',
    adresse: '',
    code_postal: '',
    lat: '',
    lng: '',
    has_garage: false,
    has_piscine: false,
    has_terrasse: false,
    description: '',
    reference: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const prixM2 = form.prix && form.surface
    ? Math.round(Number(form.prix) / Number(form.surface))
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.commune) { setError('Veuillez sélectionner une commune'); return; }
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        token,
        type_annonce: form.type_annonce,
        type_bien: form.type_bien,
        titre: form.titre || undefined,
        prix: form.prix ? Number(form.prix) : undefined,
        surface: form.surface ? Number(form.surface) : undefined,
        surface_terrain: form.surface_terrain ? Number(form.surface_terrain) : undefined,
        pieces: form.pieces ? Number(form.pieces) : undefined,
        chambres: form.chambres ? Number(form.chambres) : undefined,
        sdb: form.sdb ? Number(form.sdb) : undefined,
        dpe: form.dpe || undefined,
        annee_construction: form.annee_construction ? Number(form.annee_construction) : undefined,
        commune: form.commune,
        adresse: form.adresse || undefined,
        code_postal: form.code_postal || undefined,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        has_garage: form.has_garage,
        has_piscine: form.has_piscine,
        has_terrasse: form.has_terrasse,
        description: form.description || undefined,
        reference: form.reference || undefined,
      };

      const res = await fetch('/api/biens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur serveur');

      setSuccess(true);
      setTimeout(() => router.push(`/pro/dashboard/${token}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Bien ajouté !</h2>
          <p className="text-slate-500 text-sm">Il apparaît maintenant sur la carte Terrimo. Redirection…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/pro/dashboard/${token}`}
            className="text-slate-400 hover:text-slate-600 transition text-sm flex items-center gap-1">
            ← Retour
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-bold text-slate-900 text-sm">Ajouter un bien au portefeuille</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Type annonce */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Type d&apos;annonce</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TYPES_ANNONCE.map(t => (
              <button key={t.value} type="button"
                onClick={() => set('type_annonce', t.value)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition
                  ${form.type_annonce === t.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type bien + Commune */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Bien &amp; localisation</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de bien</label>
              <select value={form.type_bien} onChange={e => set('type_bien', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {TYPES_BIEN.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Commune *</label>
              <select value={form.commune} onChange={e => set('commune', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required>
                <option value="">Sélectionner…</option>
                {COMMUNES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse (optionnelle)</label>
            <input type="text" value={form.adresse} onChange={e => set('adresse', e.target.value)}
              placeholder="Ex : 12 avenue du Général de Gaulle"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Titre de l&apos;annonce (optionnel)</label>
            <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)}
              placeholder="Ex : Belle villa avec piscine vue mer"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Référence interne</label>
            <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)}
              placeholder="Ex : ARC-2024-042"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Prix & Surface */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Prix &amp; surface</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prix (€)</label>
              <input type="number" value={form.prix} onChange={e => set('prix', e.target.value)}
                placeholder="450000" min="0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Surface habitable (m²)</label>
              <input type="number" value={form.surface} onChange={e => set('surface', e.target.value)}
                placeholder="120" min="0" step="0.1"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {prixM2 && (
            <p className="text-sm text-indigo-600 font-medium">
              ≈ {fmt(prixM2)} €/m²
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Surface terrain (m²)</label>
              <input type="number" value={form.surface_terrain} onChange={e => set('surface_terrain', e.target.value)}
                placeholder="600" min="0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Année construction</label>
              <input type="number" value={form.annee_construction} onChange={e => set('annee_construction', e.target.value)}
                placeholder="1985" min="1800" max={new Date().getFullYear()}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Pièces & DPE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Caractéristiques</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pièces</label>
              <input type="number" value={form.pieces} onChange={e => set('pieces', e.target.value)}
                placeholder="5" min="1"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chambres</label>
              <input type="number" value={form.chambres} onChange={e => set('chambres', e.target.value)}
                placeholder="3" min="0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">SDB</label>
              <input type="number" value={form.sdb} onChange={e => set('sdb', e.target.value)}
                placeholder="2" min="0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* DPE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">DPE</label>
            <div className="flex gap-2 flex-wrap">
              {DPE_OPTIONS.map(d => {
                const colors: Record<string, string> = {
                  A: 'bg-green-500', B: 'bg-lime-400', C: 'bg-yellow-300',
                  D: 'bg-orange-300', E: 'bg-orange-400', F: 'bg-red-400', G: 'bg-red-600',
                };
                return (
                  <button key={d} type="button"
                    onClick={() => set('dpe', form.dpe === d ? '' : d)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition border-2
                      ${form.dpe === d
                        ? `${colors[d]} text-white border-transparent`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4 flex-wrap">
            {[
              { key: 'has_garage',   label: '🚗 Garage' },
              { key: 'has_piscine',  label: '🏊 Piscine' },
              { key: 'has_terrasse', label: '☀️ Terrasse' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox"
                  checked={form[opt.key as keyof typeof form] as boolean}
                  onChange={e => set(opt.key, e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Géolocalisation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">Géolocalisation</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Optionnel — permet d&apos;afficher un pin précis sur la carte.
              Trouvez les coordonnées sur{' '}
              <a href="https://www.latlong.net" target="_blank" rel="noopener noreferrer"
                className="text-indigo-500 underline">latlong.net</a>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitude</label>
              <input type="number" value={form.lat} onChange={e => set('lat', e.target.value)}
                placeholder="44.6587" step="any"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitude</label>
              <input type="number" value={form.lng} onChange={e => set('lng', e.target.value)}
                placeholder="-1.1683" step="any"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} placeholder="Décrivez le bien : orientation, vue, état général, atouts…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Link href={`/pro/dashboard/${token}`}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium text-center hover:bg-slate-50 transition">
            Annuler
          </Link>
          <button type="submit" disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition">
            {submitting ? 'Enregistrement…' : '✓ Ajouter ce bien'}
          </button>
        </div>
      </form>
    </div>
  );
}
