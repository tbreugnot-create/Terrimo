'use client';

import Link from 'next/link';
import type { ActeurDetail } from '@/lib/terrimo-types';
import AvisSection from '@/components/AvisSection';

const SERVICES_DEFAUT = [
  'DPE — Diagnostic de Performance Énergétique',
  'Amiante',
  'Plomb (CREP)',
  'Électricité',
  'Gaz',
  'Termites',
  'Loi Carrez / Loi Boutin',
  'État des risques (ERP)',
];

const CERTIF_ICONS: Record<string, string> = {
  dpe: '🌡️',
  amiante: '🔬',
  plomb: '⚗️',
  electricite: '⚡',
  gaz: '🔥',
  termites: '🐛',
  carrez: '📐',
};

export default function DiagnostiqueurPageClient({ acteur }: { acteur: ActeurDetail }) {
  const desc = acteur.meta?.description;
  const services: string[] = (acteur.meta?.services as string[] | undefined) ?? SERVICES_DEFAUT;
  const certifications: string[] = (acteur.meta?.certifications as string[] | undefined) ?? [];
  const zones: string[] = (acteur.meta?.zones_couvertes as string[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl flex-shrink-0 border-2 border-emerald-200">
              🔍
            </div>

            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Link href="/" className="hover:text-emerald-600">Carte</Link>
                <span>›</span>
                <Link href="/evaluer?intention=diagnostiquer" className="hover:text-emerald-600">Diagnostiqueurs</Link>
                <span>›</span>
                <span className="text-gray-600">{acteur.name}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{acteur.name}</h1>
                {acteur.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                    ✓ Certifié Terrimo
                  </span>
                )}
                {acteur.plan === 'pro' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                    ★ Pro
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 mt-1">
                <span className="font-medium text-emerald-700">Diagnostiqueur immobilier</span>
                {acteur.commune && <span> · 📍 {acteur.commune}</span>}
              </div>

              {/* Rating Google */}
              {acteur.google_rating && (
                <div className="flex items-center gap-1.5 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-base ${i <= Math.round(acteur.google_rating!) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                  <span className="text-sm font-bold text-gray-800 ml-1">{acteur.google_rating.toFixed(1)}</span>
                  {acteur.google_reviews && (
                    <span className="text-xs text-gray-400">({acteur.google_reviews} avis Google)</span>
                  )}
                </div>
              )}

              {desc && <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">{desc}</p>}
            </div>
          </div>

          {/* CTAs contact */}
          <div className="flex flex-wrap gap-3 mt-8">
            {acteur.phone && (
              <a href={`tel:${acteur.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                📞 {acteur.phone}
              </a>
            )}
            {acteur.email && (
              <a href={`mailto:${acteur.email}`}
                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                ✉️ {acteur.email}
              </a>
            )}
            {acteur.website && (
              <a href={acteur.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                🌐 Site web
              </a>
            )}
            <Link href={`/?layer=pros&acteur=${acteur.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors">
              🗺️ Voir sur la carte
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Contenu ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        {/* Diagnostics proposés */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Diagnostics immobiliers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s) => {
              const key = Object.keys(CERTIF_ICONS).find(k => s.toLowerCase().includes(k));
              const icon = key ? CERTIF_ICONS[key] : '📋';
              return (
                <div key={s} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <span className="text-emerald-500 flex-shrink-0">{icon}</span>
                  <span>{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">🏅 Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span key={c} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Adresse */}
        {acteur.address && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">📍 Localisation</h3>
            <p className="text-sm text-gray-600">{acteur.address}</p>
            {acteur.commune && <p className="text-sm text-gray-600">{acteur.commune}</p>}
          </div>
        )}

        {/* Zones couvertes */}
        {zones.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Communes d&apos;intervention</h3>
            <div className="flex flex-wrap gap-2">
              {zones.map((z) => (
                <span key={z} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">📍 {z}</span>
              ))}
            </div>
          </div>
        )}

        {/* Infos DPE */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🌡️</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Pourquoi réaliser un DPE ?</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Le Diagnostic de Performance Énergétique est obligatoire pour toute vente ou location. Il influence directement la valeur de votre bien. Un DPE réalisé par un diagnostiqueur certifié est valable 10 ans.
              </p>
              <Link href="/evaluer" className="inline-block mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors">
                Estimer l&apos;impact du DPE sur mon bien →
              </Link>
            </div>
          </div>
        </div>

        {/* Section avis Terrimo */}
        <div className="pt-8 border-t border-gray-200">
          <AvisSection acteurId={acteur.id} acteurName={acteur.name} />
        </div>

        {/* Back */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <Link href="/evaluer?intention=diagnostiquer" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors">
            ← Voir tous les diagnostiqueurs du Bassin
          </Link>
        </div>
      </div>
    </div>
  );
}
