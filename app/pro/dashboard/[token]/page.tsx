'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  type_local?: string;
  surface?: number;
  estimation_centrale?: number;
  status: string;
  created_at: string;
}

interface Bien {
  id: number;
  type_annonce: string;
  type_bien: string;
  titre?: string;
  prix?: number;
  surface?: number;
  commune?: string;
  pieces?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

interface Acteur {
  id: number;
  type: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'premium';
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  commune?: string;
  description?: string;
  logo_url?: string;
  google_rating?: number;
  google_reviews?: number;
  is_verified: boolean;
  is_active: boolean;
  leads_recents?: Lead[];
  biens?: Bien[];
}

const PLAN_CONFIG = {
  free:    { label: 'Free',    color: 'bg-slate-100 text-slate-700',   icon: '🆓' },
  pro:     { label: 'Pro',     color: 'bg-indigo-100 text-indigo-700', icon: '⭐' },
  premium: { label: 'Premium', color: 'bg-amber-100 text-amber-700',   icon: '💎' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

// ─────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────
export default function ProDashboard() {
  const params   = useParams();
  const token    = params.token as string;

  const [acteur,   setActeur]   = useState<Acteur | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState<'leads' | 'fiche' | 'biens'>('leads');
  const [saving,   setSaving]   = useState(false);
  const [saveOk,   setSaveOk]   = useState(false);
  const [saveErr,  setSaveErr]  = useState('');

  // Form édition fiche
  const [editForm, setEditForm] = useState({
    name: '', phone: '', email: '', website: '', address: '', commune: '', description: '',
  });

  useEffect(() => {
    if (!token) return;
    fetch(`/api/pro/fiche?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        const a: Acteur = d.acteur;
        setActeur(a);
        setEditForm({
          name:        a.name        ?? '',
          phone:       a.phone       ?? '',
          email:       a.email       ?? '',
          website:     a.website     ?? '',
          address:     a.address     ?? '',
          commune:     a.commune     ?? '',
          description: a.description ?? '',
        });
      })
      .catch(() => setError('Impossible de charger votre fiche'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true); setSaveOk(false); setSaveErr('');
    try {
      const res = await fetch(`/api/pro/fiche?token=${token}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(editForm),
      });
      const d = await res.json();
      if (!res.ok) {
        setSaveErr(d.error ?? 'Erreur');
      } else {
        setSaveOk(true);
        setActeur(a => a ? { ...a, ...editForm } : a);
        setTimeout(() => setSaveOk(false), 3000);
      }
    } catch {
      setSaveErr('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  // ── États de chargement ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  if (error || !acteur) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Lien invalide</h1>
          <p className="text-slate-500 text-sm mb-6">{error || 'Ce lien n\'est pas valide ou a expiré.'}</p>
          <Link href="/pro/rejoindre" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-500 transition">
            Créer mon espace pro →
          </Link>
        </div>
      </div>
    );
  }

  const plan = acteur.plan;
  const planCfg = PLAN_CONFIG[plan];
  const canEdit = plan !== 'free';
  const leads = acteur.leads_recents ?? [];
  const biens = acteur.biens ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-slate-900">
              Terri<span className="text-indigo-600">mo</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">Espace Pro</span>
          </div>
          <div className="flex items-center gap-3">
            {!acteur.is_active && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                ⏳ En attente de validation
              </span>
            )}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${planCfg.color}`}>
              {planCfg.icon} {planCfg.label}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Hero fiche */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{acteur.name}</h1>
            <p className="text-slate-500 mt-1">
              {acteur.type === 'agence' ? '🏢 Agence immobilière' :
               acteur.type === 'notaire' ? '⚖️ Office notarial' : '🔬 Cabinet de diagnostic'}
              {acteur.commune ? ` · ${acteur.commune}` : ''}
            </p>
            {acteur.google_rating && (
              <p className="text-sm text-amber-600 mt-1">⭐ {acteur.google_rating} / 5 · {acteur.google_reviews} avis Google</p>
            )}
          </div>
          <Link href={`/#map`}
            className="shrink-0 text-sm text-indigo-600 hover:underline border border-indigo-200 px-3 py-1.5 rounded-lg">
            Voir sur la carte →
          </Link>
        </div>

        {/* Plan Free → CTA upgrade */}
        {plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 mb-6 text-white flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg mb-1">Passez en Pro ou Premium</p>
              <p className="text-indigo-100 text-sm">Recevez les leads de votre commune · Modifiez votre fiche · Ajoutez vos biens</p>
            </div>
            <Link href="/pro/rejoindre"
              className="shrink-0 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition">
              Upgrader →
            </Link>
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'leads', label: `🔔 Leads${leads.length ? ` (${leads.length})` : ''}`, locked: plan === 'free' },
            { id: 'fiche', label: '✏️ Ma fiche',  locked: false },
            { id: 'biens', label: `🏠 Mes biens${biens.length ? ` (${biens.length})` : ''}`, locked: plan === 'free' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'leads' | 'fiche' | 'biens')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition relative ${
                tab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.locked && <span className="ml-1 text-xs">🔒</span>}
            </button>
          ))}
        </div>

        {/* ── ONGLET LEADS ──────────────────────────────────────── */}
        {tab === 'leads' && (
          <div>
            {plan === 'free' ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Leads disponibles avec le plan Pro</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  Recevez en temps réel les coordonnées des propriétaires qui estiment leur bien sur votre commune.
                </p>
                <Link href="/pro/rejoindre"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
                  Passer en Pro — 49€/mois →
                </Link>
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun lead pour l'instant</h3>
                <p className="text-slate-500 text-sm">Les leads de votre commune apparaîtront ici dès qu'un propriétaire soumettra une estimation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map(lead => (
                  <div key={lead.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{lead.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {lead.status === 'new' ? '🆕 Nouveau' : lead.status === 'contacted' ? '📞 Contacté' : '✅ Qualifié'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
                        {lead.phone && <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">{lead.phone}</a>}
                        <span>{lead.email}</span>
                        {lead.type_local && <span>{lead.type_local}{lead.surface ? ` · ${lead.surface} m²` : ''}</span>}
                        {lead.estimation_centrale && <span className="text-emerald-600 font-medium">{fmt(lead.estimation_centrale)}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-slate-400">{fmtDate(lead.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET FICHE ──────────────────────────────────────── */}
        {tab === 'fiche' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            {!canEdit && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-amber-800">🔒 Modification réservée aux plans Pro et Premium.</p>
                <Link href="/pro/rejoindre" className="shrink-0 text-xs font-bold text-amber-700 underline">Upgrader</Link>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Nom',     key: 'name',    type: 'text',  placeholder: 'Nom de votre agence' },
                { label: 'Email',   key: 'email',   type: 'email', placeholder: 'contact@agence.fr' },
                { label: 'Tél',     key: 'phone',   type: 'tel',   placeholder: '05 56 …' },
                { label: 'Site web',key: 'website', type: 'url',   placeholder: 'https://…' },
                { label: 'Adresse', key: 'address', type: 'text',  placeholder: '12 rue du Maréchal Foch' },
                { label: 'Commune', key: 'commune', type: 'text',  placeholder: 'ARCACHON' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={editForm[f.key as keyof typeof editForm]}
                    onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    disabled={!canEdit}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Description (visible sur votre fiche)</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  disabled={!canEdit}
                  rows={3}
                  placeholder="Présentez votre agence en quelques mots…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-400 resize-none"
                />
              </div>
            </div>

            {canEdit && (
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
                </button>
                {saveOk && <span className="text-sm text-emerald-600 font-medium">✅ Sauvegardé !</span>}
                {saveErr && <span className="text-sm text-red-600">{saveErr}</span>}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET BIENS ──────────────────────────────────────── */}
        {tab === 'biens' && (
          <div>
            {plan === 'free' ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Portefeuille disponible avec le plan Pro</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  Ajoutez vos biens en vente ou en location. Ils apparaissent comme pins sur la carte Terrimo.
                </p>
                <Link href="/pro/rejoindre"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
                  Passer en Pro — 49€/mois →
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Mes biens ({biens.length})</h3>
                  <Link href={`/pro/dashboard/${token}/nouveau-bien`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                    + Ajouter un bien
                  </Link>
                </div>
                {biens.length === 0 ? (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
                    <div className="text-3xl mb-2">🏠</div>
                    <p className="text-slate-500 text-sm">Aucun bien ajouté. Commencez par ajouter votre premier bien.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {biens.map(b => (
                      <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{b.titre ?? `${b.type_bien} · ${b.commune}`}</div>
                          <div className="text-sm text-slate-500">
                            {b.type_annonce === 'vente' ? '💰 Vente' : '🔑 Location'}
                            {b.prix ? ` · ${fmt(b.prix)}` : ''}
                            {b.surface ? ` · ${b.surface} m²` : ''}
                            {b.pieces ? ` · ${b.pieces} pièces` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {b.is_featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⭐ Mis en avant</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {b.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
