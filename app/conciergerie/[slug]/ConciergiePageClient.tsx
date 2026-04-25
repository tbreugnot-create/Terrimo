'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ActeurDetail, BienPreview } from '@/app/agence/[slug]/page';

const formatPrix = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const SERVICE_LABELS: Record<string, { icon: string; label: string; desc: string }> = {
  gestion_locative:   { icon: '🏠', label: 'Gestion locative',   desc: 'Contrats, état des lieux, quittances' },
  menage:             { icon: '🧹', label: 'Ménage & entretien', desc: 'Nettoyage entre chaque séjour' },
  accueil_voyageurs:  { icon: '🤝', label: 'Accueil voyageurs',  desc: 'Remise des clés, installation' },
  maintenance:        { icon: '🔧', label: 'Maintenance',        desc: 'Petites réparations, suivi travaux' },
  linge:              { icon: '🛏️', label: 'Linge & draps',      desc: 'Fourniture et entretien du linge' },
  conciergerie_24h:   { icon: '📞', label: 'Permanence 24h/7j',  desc: 'Assistance en cas d\'urgence' },
  photos_pro:         { icon: '📸', label: 'Photos professionnelles', desc: 'Mise en valeur du bien' },
  diffusion_annonces: { icon: '📣', label: 'Diffusion annonces', desc: 'Airbnb, Booking, Abritel...' },
};

function BienMiniCard({ bien }: { bien: BienPreview }) {
  const photoUrl = bien.photos?.[0]?.url;
  return (
    <Link href={`/bien/${bien.id}`}
      className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-all">
      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {photoUrl
          ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">🏡</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 truncate">{bien.titre ?? bien.type_bien}</div>
        {bien.commune && <div className="text-xs text-gray-500">📍 {bien.commune}</div>}
        {bien.prix && <div className="text-xs font-bold text-indigo-700 mt-0.5">{formatPrix(bien.prix)}/sem.</div>}
      </div>
      <span className="text-gray-400 text-xs group-hover:text-indigo-500">→</span>
    </Link>
  );
}

// ─── Modal "Confier mon bien" ──────────────────────────────
function ConfianceModal({
  conciergerie,
  onClose,
}: {
  conciergerie: ActeurDetail;
  onClose: () => void;
}) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commune, setCommune] = useState('');
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email) return;
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, commune,
          source: 'conciergerie_vitrine',
          intention: 'louer',
          acteur_id: conciergerie.id,
          acteur_name: conciergerie.name,
        }),
      });
      setSent(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Confier mon bien en gestion</h3>
            <p className="text-sm text-gray-500">à {conciergerie.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">✕</button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-gray-900">Demande envoyée !</p>
            <p className="text-sm text-gray-500 mt-1">{conciergerie.name} vous contactera très prochainement.</p>
            <button onClick={onClose} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold">Fermer</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="text" placeholder="Votre nom *" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="tel" placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="text" placeholder="Commune de votre bien" value={commune} onChange={e => setCommune(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none" />
            <p className="text-xs text-gray-400">Vos informations ne seront partagées qu'avec {conciergerie.name}.</p>
            <button
              onClick={handleSubmit}
              disabled={loading || !name || !email}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi en cours…' : 'Envoyer ma demande →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────
export default function ConciergiePageClient({
  conciergerie,
  biensGeres,
}: {
  conciergerie: ActeurDetail;
  biensGeres: BienPreview[];
}) {
  const [showModal, setShowModal] = useState(false);
  const services       = conciergerie.meta?.services ?? [];
  const certifications = conciergerie.meta?.certifications ?? [];
  const zonesCouvertes = conciergerie.meta?.zones_couvertes ?? [];
  const tarifGestion   = conciergerie.meta?.tarif_gestion;
  const desc           = conciergerie.meta?.description;

  return (
    <div className="min-h-screen bg-gray-50">
      {showModal && <ConfianceModal conciergerie={conciergerie} onClose={() => setShowModal(false)} />}

      {/* ─── Hero ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-black text-3xl flex-shrink-0 border-2 border-teal-200">
              🏡
            </div>

            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Link href="/" className="hover:text-indigo-600">Carte</Link>
                <span>›</span>
                <span>Conciergeries</span>
                <span>›</span>
                <span className="text-gray-600">{conciergerie.name}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{conciergerie.name}</h1>
                {conciergerie.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100">
                    ✓ Vérifié Terrimo
                  </span>
                )}
                {conciergerie.plan === 'pro' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                    ★ Pro
                  </span>
                )}
              </div>

              {conciergerie.commune && (
                <div className="text-gray-500 mt-1 text-sm">📍 {conciergerie.commune}</div>
              )}

              {/* Rating */}
              {conciergerie.google_rating && (
                <div className="flex items-center gap-1.5 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-base ${i <= Math.round(conciergerie.google_rating!) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                  <span className="text-sm font-bold text-gray-800 ml-1">{conciergerie.google_rating.toFixed(1)}</span>
                  {conciergerie.google_reviews && (
                    <span className="text-xs text-gray-400">({conciergerie.google_reviews} avis Google)</span>
                  )}
                </div>
              )}

              {desc && <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">{desc}</p>}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors"
            >
              🏠 Confier mon bien en gestion
            </button>
            {conciergerie.phone && (
              <a href={`tel:${conciergerie.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors">
                📞 {conciergerie.phone}
              </a>
            )}
            {conciergerie.email && (
              <a href={`mailto:${conciergerie.email}`}
                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                ✉️ {conciergerie.email}
              </a>
            )}
            {conciergerie.website && (
              <a href={conciergerie.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                🌐 Site web
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ─── Contenu ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-10">

            {/* Services */}
            {services.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">Nos services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((s: string) => {
                    const info = SERVICE_LABELS[s] ?? { icon: '✓', label: s.replace(/_/g, ' '), desc: '' };
                    return (
                      <div key={s} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                        <span className="text-2xl flex-shrink-0">{info.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-gray-900 capitalize">{info.label}</div>
                          {info.desc && <div className="text-xs text-gray-500 mt-0.5">{info.desc}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Biens gérés */}
            {biensGeres.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">Biens en gestion ({biensGeres.length})</h2>
                <div className="space-y-3">
                  {biensGeres.map(b => <BienMiniCard key={b.id} bien={b} />)}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((c: string) => (
                    <span key={c} className="px-3 py-1.5 bg-green-50 text-green-800 border border-green-200 rounded-full text-sm font-medium">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne sticky info */}
          <div className="space-y-5">

            {/* Tarif */}
            {tarifGestion && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2">💰 Tarif de gestion</h3>
                <p className="text-sm text-gray-600">{tarifGestion}</p>
              </div>
            )}

            {/* Zones couvertes */}
            {(zonesCouvertes.length > 0 || conciergerie.commune) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">📍 Zones couvertes</h3>
                <div className="flex flex-wrap gap-2">
                  {zonesCouvertes.length > 0
                    ? zonesCouvertes.map((z: string) => (
                        <span key={z} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{z}</span>
                      ))
                    : conciergerie.commune && (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{conciergerie.commune}</span>
                      )
                  }
                </div>
              </div>
            )}

            {/* CTA sticky */}
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-5 text-white">
              <div className="text-2xl mb-2">🏠</div>
              <h3 className="font-bold mb-1">Propriétaire sur le Bassin ?</h3>
              <p className="text-teal-100 text-xs mb-4 leading-relaxed">
                Déléguez la gestion de votre résidence secondaire. Location saisonnière, accueil, entretien : on s'occupe de tout.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-white text-teal-700 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors"
              >
                Confier mon bien →
              </button>
            </div>

            {/* Adresse */}
            {conciergerie.address && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2">📮 Adresse</h3>
                <p className="text-sm text-gray-600">{conciergerie.address}</p>
              </div>
            )}
          </div>
        </div>

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
