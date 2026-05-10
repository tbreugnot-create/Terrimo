'use client';

import { useEffect, useState } from 'react';

interface Avis {
  id: number;
  auteur_nom: string;
  note: number;
  commentaire: string;
  type_transaction: string;
  created_at: string;
}

interface Stats {
  total: number;
  moyenne: string | null;
  n5: number; n4: number; n3: number; n2: number; n1: number;
}

const TX_LABELS: Record<string, string> = {
  achat: 'Achat', vente: 'Vente', location: 'Location',
  estimation: 'Estimation', autre: 'Autre prestation',
};

function Stars({ note, size = 18 }: { note: number; size?: number }) {
  return (
    <span aria-label={`${note} étoiles sur 5`} role="img">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          fontSize: size, color: i <= note ? '#f59e0b' : '#e2e8f0', lineHeight: 1,
        }}>★</span>
      ))}
    </span>
  );
}

function BarChart({ n5, n4, n3, n2, n1, total }: { n5: number; n4: number; n3: number; n2: number; n1: number; total: number }) {
  const bars = [
    { label: '5', count: n5 },
    { label: '4', count: n4 },
    { label: '3', count: n3 },
    { label: '2', count: n2 },
    { label: '1', count: n1 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {bars.map(b => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem' }}>
          <span style={{ color: '#64748b', width: 8, textAlign: 'right', flexShrink: 0 }}>{b.label}</span>
          <span style={{ color: '#f59e0b', fontSize: '.9rem', flexShrink: 0 }}>★</span>
          <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: total > 0 ? `${Math.round(b.count / total * 100)}%` : '0%',
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              borderRadius: 4,
              transition: 'width .4s ease',
            }} />
          </div>
          <span style={{ color: '#94a3b8', width: 24, textAlign: 'right', flexShrink: 0 }}>{b.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function AvisSection({ acteurId, acteurName }: { acteurId: number; acteurName: string }) {
  const [avis,    setAvis]    = useState<Avis[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [nom,  setNom]  = useState('');
  const [email, setEmail] = useState('');
  const [note,  setNote]  = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [txType, setTxType] = useState('achat');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    fetch(`/api/avis?acteur_id=${acteurId}`)
      .then(r => r.json())
      .then(d => { setAvis(d.avis ?? []); setStats(d.stats ?? null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [acteurId]);

  async function submitAvis(e: React.FormEvent) {
    e.preventDefault();
    setFormErr('');
    if (!note) { setFormErr('Choisissez une note'); return; }
    setSending(true);
    try {
      const r = await fetch('/api/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acteur_id: acteurId, auteur_nom: nom, auteur_email: email, note, commentaire, type_transaction: txType }),
      });
      const d = await r.json();
      if (!r.ok) { setFormErr(d.error ?? 'Erreur'); }
      else { setSent(true); setShowForm(false); }
    } catch {
      setFormErr('Erreur réseau, réessayez.');
    } finally { setSending(false); }
  }

  const avgNote = stats?.moyenne ? parseFloat(stats.moyenne) : null;

  return (
    <section style={{ marginTop: '2rem' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Avis clients
          {stats && stats.total > 0 && (
            <span style={{ fontSize: '.85rem', fontWeight: 500, color: '#64748b', marginLeft: 8 }}>
              ({stats.total})
            </span>
          )}
        </h2>
        {!sent && (
          <button
            onClick={() => setShowForm(s => !s)}
            style={{
              background: showForm ? '#f1f5f9' : '#0f172a',
              color: showForm ? '#334155' : 'white',
              border: 'none', borderRadius: 10,
              padding: '9px 18px', fontSize: '.875rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {showForm ? '✕ Annuler' : '✏️ Laisser un avis'}
          </button>
        )}
      </div>

      {/* Stats globales */}
      {!loading && stats && stats.total > 0 && (
        <div style={{
          background: '#f8fafc', borderRadius: 16, padding: '1.25rem',
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem',
          alignItems: 'center', marginBottom: '1.5rem',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
              {avgNote?.toFixed(1)}
            </div>
            <Stars note={Math.round(avgNote ?? 0)} size={16} />
            <div style={{ color: '#64748b', fontSize: '.75rem', marginTop: 4 }}>
              {stats.total} avis Terrimo
            </div>
          </div>
          <BarChart {...stats} />
        </div>
      )}

      {/* Message envoyé */}
      {sent && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
          padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#166534',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          ✅ Merci ! Votre avis sera publié après modération.
        </div>
      )}

      {/* Formulaire */}
      {showForm && !sent && (
        <div style={{
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 16,
          padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 2px 16px rgba(0,0,0,.06)',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            Votre expérience avec {acteurName}
          </h3>
          <form onSubmit={submitAvis}>
            {/* Note étoiles */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>
                Note *
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNote(n)}
                    onMouseEnter={() => setHoverNote(n)}
                    onMouseLeave={() => setHoverNote(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '2rem', padding: '2px 4px',
                      color: n <= (hoverNote || note) ? '#f59e0b' : '#e2e8f0',
                      transition: 'color .1s, transform .1s',
                      transform: n <= (hoverNote || note) ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >★</button>
                ))}
              </div>
            </div>

            {/* Type transaction */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Type de prestation *
              </label>
              <select
                value={txType}
                onChange={e => setTxType(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', fontSize: '.9rem',
                  background: 'white', color: '#334155',
                }}
              >
                {Object.entries(TX_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* Commentaire */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Commentaire * <span style={{ color: '#94a3b8', fontWeight: 400 }}>(min. 20 caractères)</span>
              </label>
              <textarea
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                placeholder="Décrivez votre expérience : réactivité, professionnalisme, résultats…"
                rows={4}
                required
                minLength={20}
                maxLength={1000}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', fontSize: '.9rem',
                  resize: 'vertical', fontFamily: 'inherit', color: '#334155',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Identité */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Prénom & Nom *
                </label>
                <input
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Marie D."
                  required
                  minLength={2}
                  maxLength={120}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #e2e8f0', fontSize: '.9rem',
                    color: '#334155', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Email <span style={{ color: '#94a3b8', fontWeight: 400 }}>(non publié)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@email.fr"
                  required
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #e2e8f0', fontSize: '.9rem',
                    color: '#334155', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {formErr && (
              <p style={{ color: '#ef4444', fontSize: '.85rem', marginBottom: '0.75rem' }}>
                ⚠️ {formErr}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              style={{
                background: sending ? '#94a3b8' : '#0f172a',
                color: 'white', border: 'none', borderRadius: 12,
                padding: '12px 24px', fontSize: '.95rem', fontWeight: 700,
                cursor: sending ? 'not-allowed' : 'pointer', width: '100%',
                transition: 'background .15s',
              }}
            >
              {sending ? 'Envoi…' : 'Soumettre mon avis'}
            </button>
            <p style={{ color: '#94a3b8', fontSize: '.75rem', textAlign: 'center', marginTop: 8 }}>
              Votre avis sera publié après vérification par notre équipe.
            </p>
          </form>
        </div>
      )}

      {/* Liste des avis */}
      {loading && (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
          Chargement des avis…
        </p>
      )}

      {!loading && avis.length === 0 && !showForm && (
        <div style={{
          background: '#f8fafc', borderRadius: 14, padding: '2rem',
          textAlign: 'center', border: '1px dashed #e2e8f0',
        }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Aucun avis pour le moment — soyez le premier à donner votre avis !
          </p>
        </div>
      )}

      {avis.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {avis.map(a => {
            const dateStr = new Date(a.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            const initials = a.auteur_nom.split(' ').map((w: string) => w[0]?.toUpperCase() ?? '').join('').slice(0, 2);
            return (
              <div key={a.id} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '.85rem', flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '.9rem' }}>{a.auteur_nom}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '.75rem' }}>{TX_LABELS[a.type_transaction] ?? a.type_transaction} · {dateStr}</p>
                    </div>
                  </div>
                  <Stars note={a.note} size={16} />
                </div>
                <p style={{ color: '#334155', fontSize: '.9rem', lineHeight: 1.6, margin: 0 }}>
                  {a.commentaire}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
