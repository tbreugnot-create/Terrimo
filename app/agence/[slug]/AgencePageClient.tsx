'use client';

import Link from 'next/link';
import type { ActeurDetail, BienPreview } from '@/lib/terrimo-types';

const formatPrix = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const ANNONCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  vente:      { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Vente' },
  location:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Location' },
  viager:     { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Viager' },
  neuf:       { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Neuf' },
  commercial: { bg: 'bg-slate-100',  text: 'text-slate-700',  label: 'Commercial' },
};

const TYPE_EMOJI: Record<string, string> = {
  maison:       '🏡',
  appartement:  '🏢',
  terrain:      '🌿',
  immeuble:     '🏗️',
  commerce:     '🏪',
  bureau:       '💼',
  parking:      '🚗',
};

function BienCard({ bien }: { bien: BienPreview }) {
  const annonce   = ANNONCE_COLORS[bien.type_annonce] ?? ANNONCE_COLORS.vente;
  const emoji     = TYPE_EMOJI[bien.type_bien?.toLowerCase()] ?? '🏠';
  const photoUrl  = bien.photos?.[0]?.url;

  return (
    <Link href={`/bien/${bien.id}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
      {/* Photo / placeholder */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={bien.titre ?? bien.type_bien} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">{emoji}</div>
        )}
        {bien.is_featured && (
          <div className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐ À la une</div>
        )}
        <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${annonce.bg} ${annonce.text}`}>
          {annonce.label}
        </div>
      </div>

      {/* Infos */}
      <div className="p-3">
        <div className="text-sm font-semibold text-gray-900 truncate">
          {bien.titre ?? `${bien.type_bien} ${annonce.label.toLowerCase()}`}
        </div>
        {bien.commune && <div className="text-xs text-gray-500 mt-0.5">📍 {bien.commune}</div>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {bien.surface && <span>{bien.surface} m²</span>}
            {bien.pieces  && <span>· {bien.pieces} p.</span>}
          </div>
          {bien.prix && (
            <div className="text-sm font-bold text-gray-900">{formatPrix(bien.prix)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function AgencePageClient({
  acteur,
  biens,
}: {
  acteur: ActeurDetail;
  biens: BienPreview[];
}) {
  const communesSet = new Set(biens.map(b => b.commune).filter(Boolean));
  const nbCommunes  = communesSet.size;
  const desc = acteur.meta?.description;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero bannière ────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-3xl flex-shrink-0 border-2 border-indigo-200">
              {acteur.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Link href="/" className="hover:text-indigo-600">Carte</Link>
                <span>›</span>
                <span>Agences</span>
                <span>›</span>
                <span className="text-gray-600">{acteur.name}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{acteur.name}</h1>
                {acteur.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                    ✓ Vérifié Terrimo
                  </span>
                )}
                {acteur.plan === 'pro' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                    ★ Pro
                  </span>
                )}
              </div>

              {acteur.commune && (
                <div className="text-gray-500 mt-1 text-sm">📍 {acteur.commune}</div>
              )}

              {/* Rating */}
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

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-black text-indigo-700">{biens.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">biens actifs</div>
            </div>
            {nbCommunes > 0 && (
              <div className="text-center">
                <div className="text-2xl font-black text-indigo-700">{nbCommunes}</div>
                <div className="text-xs text-gray-500 mt-0.5">communes</div>
              </div>
            )}
            {acteur.google_reviews && (
              <div className="text-center">
                <div className="text-2xl font-black text-indigo-700">{acteur.google_reviews}</div>
                <div className="text-xs text-gray-500 mt-0.5">avis clients</div>
              </div>
            )}
          </div>

          {/* CTAs contact */}
          <div className="flex flex-wrap gap-3 mt-6">
            {acteur.phone && (
              <a href={`tel:${acteur.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors">
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
            <Link href={`/?layer=biens&acteur=${acteur.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors">
              🗺️ Voir sur la carte
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Contenu ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Biens actifs */}
        {biens.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Biens en portefeuille</h2>
              <span className="text-sm text-gray-400">{biens.length} bien{biens.length > 1 ? 's' : ''} actif{biens.length > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {biens.map((b) => <BienCard key={b.id} bien={b} />)}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-lg font-medium text-gray-600">Aucun bien en ligne pour le moment</p>
            <p className="text-sm mt-1">Revenez bientôt — le portefeuille se met à jour régulièrement.</p>
          </div>
        )}

        {/* Communes couvertes */}
        {nbCommunes > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4">Communes d'intervention</h3>
            <div className="flex flex-wrap gap-2">
              {[...communesSet].map((c) => (
                <span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">📍 {c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            ← Retour à la carte Terrimo
          </Link>
        </div>
      </div>
    </div>
  );
}
