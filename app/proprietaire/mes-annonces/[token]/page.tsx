'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const COMMUNES = [
  'Arcachon', 'La Teste-de-Buch', 'Gujan-Mestras', 'Lège-Cap-Ferret',
  'Andernos-les-Bains', 'Arès', 'Lanton', 'Audenge', 'Biganos', 'Mios', 'Le Teich',
];
const TYPES_BIEN = ['Maison', 'Villa', 'Appartement', 'Studio', 'Terrain', 'Autre'];
const TYPES_ANNONCE = [
  { value: 'vente',    label: '💰 Vente' },
  { value: 'location', label: '🔑 Location' },
];
const DPE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const DPE_COLORS: Record<string, string> = {
  A: '#16a34a', B: '#65a30d', C: '#ca8a04', D: '#d97706', E: '#ea580c', F: '#dc2626', G: '#991b1b',
};

interface Bien {
  id: number;
  type_annonce: string;
  type_bien: string;
  titre: string;
  prix: number;
  surface: number;
  pieces: number;
  commune: string;
  dpe: string;
  is_active: boolean;
  created_at: string;
}

interface Acteur {
  id: number;
  name: string;
  email: string;
  plan: string;
}

type Step = 'dashboard' | 'form' | 'success';

export default function MesAnnoncesPage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();

  const [acteur, setActeur]  = useState<Acteur | null>(null);
  const [biens, setBiens]    = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep]      = useState<Step>('dashboard');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    type_annonce: 'vente',
    type_bien: 'Maison',
    titre: '',
    prix: '',
    surface: '',
    pieces: '',
    chambres: '',
    dpe: '',
    commune: '',
    adresse: '',
    has_garage: false,
    has_piscine: false,
    has_terrasse: false,
    description: '',
    photos: [] as string[],
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // Charger le profil et les biens + sauvegarder le cookie de session
  useEffect(() => {
    if (!token) return;

    // Sauvegarder le token dans un cookie (30j) pour la Nav
    document.cookie = `terrimo_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;

    (async () => {
      try {
        const res = await fetch(`/api/biens?acteur_token=${token}`);
        if (!res.ok) { router.push('/proprietaire/auth'); return; }
        const data = await res.json() as { acteur?: Acteur; biens?: Bien[] } | Bien[];

        if (Array.isArray(data)) {
          setBiens(data);
        } else {
          if (data.acteur) setActeur(data.acteur);
          setBiens(data.biens ?? []);
        }
      } catch {
        router.push('/proprietaire/auth');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  // Upload d'une photo
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/upload?token=${token}`, { method: 'POST', body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload échoué');
      setForm(f => ({ ...f, photos: [...f.photos, json.url!] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploadingPhoto(false);
      // Reset input pour permettre de re-sélectionner le même fichier
      e.target.value = '';
    }
  }

  function removePhoto(url: string) {
    setForm(f => ({ ...f, photos: f.photos.filter(p => p !== url) }));
  }

  function handleLogout() {
    document.cookie = 'terrimo_token=; path=/; max-age=0';
    router.push('/proprietaire/auth');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.commune) { setFormError('Veuillez sélectionner une commune'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/biens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...form,
          prix: form.prix ? Number(form.prix) : undefined,
          surface: form.surface ? Number(form.surface) : undefined,
          pieces: form.pieces ? Number(form.pieces) : undefined,
          chambres: form.chambres ? Number(form.chambres) : undefined,
          dpe: form.dpe || undefined,
          adresse: form.adresse || undefined,
          photos: form.photos,
        }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Erreur serveur');
      setStep('success');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Chargement…</div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,.55)', display: 'block', marginBottom: 6 };

  // ─── Succès ────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'white' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Annonce publiée !</h2>
          <p style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.7, marginBottom: 32 }}>
            Votre bien est maintenant visible sur la carte Terrimo.
            Les acheteurs et locataires du Bassin peuvent le découvrir dès maintenant.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setStep('dashboard'); setForm({ type_annonce: 'vente', type_bien: 'Maison', titre: '', prix: '', surface: '', pieces: '', chambres: '', dpe: '', commune: '', adresse: '', has_garage: false, has_piscine: false, has_terrasse: false, description: '', photos: [] }); }}
              style={{ padding: '12px 22px', borderRadius: 12, background: '#38bdf8', color: '#0a1626', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              Voir mes annonces
            </button>
            <Link href="/" style={{ padding: '12px 22px', borderRadius: 12, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.75)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
              Explorer la carte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Formulaire ────────────────────────────────────────────
  if (step === 'form') {
    const prixM2 = form.prix && form.surface ? Math.round(Number(form.prix) / Number(form.surface)) : null;

    return (
      <div style={{ background: '#0a1628', minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ background: 'rgba(12,26,46,.97)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setStep('dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.45)', cursor: 'pointer', fontSize: 14, padding: 0 }}>
              ← Retour
            </button>
            <span style={{ color: 'rgba(255,255,255,.15)' }}>|</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Déposer une annonce</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 64px' }}>

          {/* Limite particulier */}
          {biens.length >= 3 && (
            <div style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#fbbf24', lineHeight: 1.6 }}>
              ⚠️ Vous avez atteint la limite de 3 annonces gratuites.{' '}
              <Link href="/pro/rejoindre" style={{ color: '#fbbf24', fontWeight: 700 }}>Passez en Pro</Link>
              {' '}pour en publier davantage.
            </div>
          )}

          {/* Type annonce */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '22px 20px', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, marginTop: 0 }}>Type d&apos;annonce</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TYPES_ANNONCE.map(t => (
                <button key={t.value} type="button" onClick={() => set('type_annonce', t.value)}
                  style={{ padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: `2px solid ${form.type_annonce === t.value ? '#38bdf8' : 'rgba(255,255,255,.1)'}`, background: form.type_annonce === t.value ? 'rgba(56,189,248,.15)' : 'transparent', color: form.type_annonce === t.value ? '#38bdf8' : 'rgba(255,255,255,.6)', cursor: 'pointer' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Localisation */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '22px 20px', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, marginTop: 0 }}>Localisation &amp; type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Commune *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.commune} onChange={e => set('commune', e.target.value)} required>
                  <option value="">Choisir…</option>
                  {COMMUNES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Type de bien</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type_bien} onChange={e => set('type_bien', e.target.value)}>
                  {TYPES_BIEN.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Adresse (optionnelle — permet un pin précis sur la carte)</label>
              <input style={inputStyle} placeholder="Ex : 12 avenue du Général de Gaulle" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
            </div>
          </div>

          {/* Prix & Surface */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '22px 20px', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, marginTop: 0 }}>Prix &amp; surface</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Prix (€)</label>
                <input style={inputStyle} type="number" placeholder="450000" min="0" value={form.prix} onChange={e => set('prix', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Surface (m²)</label>
                <input style={inputStyle} type="number" placeholder="120" min="1" value={form.surface} onChange={e => set('surface', e.target.value)} />
              </div>
            </div>
            {prixM2 && (
              <p style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600, marginTop: 10, marginBottom: 0 }}>
                ≈ {prixM2.toLocaleString('fr-FR')} €/m²
              </p>
            )}
          </div>

          {/* Caractéristiques */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '22px 20px', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, marginTop: 0 }}>Caractéristiques</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Pièces</label>
                <input style={inputStyle} type="number" placeholder="5" min="1" value={form.pieces} onChange={e => set('pieces', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Chambres</label>
                <input style={inputStyle} type="number" placeholder="3" min="0" value={form.chambres} onChange={e => set('chambres', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>DPE</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DPE_OPTIONS.map(d => (
                    <button key={d} type="button" onClick={() => set('dpe', form.dpe === d ? '' : d)}
                      style={{ width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 700, border: `2px solid ${form.dpe === d ? DPE_COLORS[d] : 'rgba(255,255,255,.15)'}`, background: form.dpe === d ? DPE_COLORS[d] : 'transparent', color: form.dpe === d ? 'white' : 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[['has_garage', '🚗 Garage'], ['has_piscine', '🏊 Piscine'], ['has_terrasse', '☀️ Terrasse']].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
                  <input type="checkbox" checked={form[k as keyof typeof form] as boolean} onChange={e => set(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#38bdf8' }} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '22px 20px', marginBottom: 24 }}>
            <label style={{ fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 12 }}>Description</label>
            <textarea
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              placeholder="Décrivez les atouts de votre bien : vue, orientation, état, proximité plage, accès port…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Photos */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '22px 20px', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, marginTop: 0 }}>Photos</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 0, marginBottom: 16 }}>
              JPG / PNG / WEBP · max 10 Mo par photo · jusqu&apos;à 10 photos
            </p>

            {/* Grille de miniatures */}
            {form.photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 14 }}>
                {form.photos.map((url, i) => (
                  <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3', background: 'rgba(255,255,255,.05)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.65)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 12, lineHeight: 1 }}
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, background: '#38bdf8', color: '#0a1626', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bouton ajouter */}
            {form.photos.length < 10 && (
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', borderRadius: 12, cursor: uploadingPhoto ? 'wait' : 'pointer',
                border: '1.5px dashed rgba(255,255,255,.2)', background: 'transparent',
                color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 500, transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!uploadingPhoto) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,.5)'; (e.currentTarget as HTMLElement).style.color = '#38bdf8'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'; }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                />
                {uploadingPhoto ? (
                  <>⏳ Upload en cours…</>
                ) : (
                  <><span style={{ fontSize: '1.2rem' }}>📷</span> {form.photos.length === 0 ? 'Ajouter des photos' : 'Ajouter une photo'}</>
                )}
              </label>
            )}
          </div>

          {formError && (
            <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
              {formError}
            </div>
          )}

          <button type="submit" disabled={submitting || biens.length >= 3}
            style={{ width: '100%', padding: '15px', borderRadius: 14, fontWeight: 800, fontSize: '1rem', background: submitting || biens.length >= 3 ? 'rgba(56,189,248,.3)' : '#38bdf8', color: '#0a1626', border: 'none', cursor: submitting || biens.length >= 3 ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Publication en cours…' : '✓ Publier mon annonce'}
          </button>
        </form>
      </div>
    );
  }

  // ─── Dashboard ─────────────────────────────────────────────
  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'rgba(12,26,46,.97)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '16px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', letterSpacing: '-.02em' }}>
              Terri<span style={{ color: '#38bdf8' }}>mo</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
              {acteur?.email ?? 'Espace particulier'}
            </div>
            <button
              onClick={handleLogout}
              style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
              title="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px 64px' }}>

        {/* Titre */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, margin: '0 0 8px' }}>
            Mes annonces
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, margin: 0 }}>
            {biens.length} annonce{biens.length !== 1 ? 's' : ''} · Gratuit jusqu&apos;à 3 annonces
          </p>
        </div>

        {/* CTA nouvelle annonce */}
        {biens.length < 3 && (
          <button
            onClick={() => setStep('form')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 14, background: '#38bdf8', color: '#0a1626', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 28 }}
          >
            <span style={{ fontSize: '1.2rem' }}>＋</span>
            Déposer une annonce
          </button>
        )}

        {/* Liste des biens */}
        {biens.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏠</div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Aucune annonce publiée</h3>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 24px' }}>
              Déposez votre première annonce gratuitement — votre bien sera visible sur la carte Terrimo.
            </p>
            <button
              onClick={() => setStep('form')}
              style={{ padding: '12px 24px', borderRadius: 12, background: '#38bdf8', color: '#0a1626', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              Déposer mon bien →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {biens.map(b => (
              <div key={b.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'stretch', gap: 0 }}>
                {/* Vignette photo */}
                {Array.isArray((b as Bien & { photos?: string[] }).photos) && (b as Bien & { photos?: string[] }).photos!.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(b as Bien & { photos?: string[] }).photos![0]}
                    alt=""
                    style={{ width: 80, minWidth: 80, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: 80, minWidth: 80, background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    🏠
                  </div>
                )}
                <div style={{ flex: 1, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    {b.titre || `${b.type_bien} · ${b.commune}`}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>{b.commune}</span>
                    {b.surface && <span>{b.surface} m²</span>}
                    {b.prix && <span>{b.prix.toLocaleString('fr-FR')} €</span>}
                    {b.dpe && <span style={{ color: DPE_COLORS[b.dpe] ?? 'inherit', fontWeight: 700 }}>DPE {b.dpe}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: b.type_annonce === 'vente' ? 'rgba(56,189,248,.15)' : 'rgba(99,102,241,.15)', color: b.type_annonce === 'vente' ? '#38bdf8' : '#a5b4fc', fontWeight: 700 }}>
                    {b.type_annonce === 'vente' ? 'Vente' : 'Location'}
                  </span>
                  <Link href={`/bien/${b.id}`} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textDecoration: 'none', padding: '4px 10px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }}>
                    Voir →
                  </Link>
                </div>
                </div>{/* /flex row intérieur */}
              </div>
            ))}
          </div>
        )}

        {/* Bannière upgrade si 3 biens */}
        {biens.length >= 3 && (
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.12), rgba(56,189,248,.06))', border: '1px solid rgba(99,102,241,.25)', borderRadius: 18, padding: '24px', marginTop: 28, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Limite de 3 annonces atteinte</div>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              Passez en offre Pro pour publier un nombre illimité de biens et accéder aux leads acheteurs qualifiés.
            </p>
            <Link href="/pro/rejoindre" style={{ display: 'inline-block', padding: '11px 22px', borderRadius: 12, background: 'white', color: '#0c1a2e', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
              Découvrir l&apos;offre Pro →
            </Link>
          </div>
        )}

        {/* Lien vers carte */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>
            🗺️ Explorer la carte Terrimo
          </Link>
        </div>
      </div>
    </div>
  );
}
