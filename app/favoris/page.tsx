'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFavoris } from '@/lib/useFavoris';

interface BienFavori {
  id: number;
  type_annonce: string;
  type_bien: string;
  titre?: string;
  prix?: number;
  surface?: number;
  pieces?: number;
  commune?: string;
  adresse?: string;
  dpe?: string;
  photos: { url: string }[];
  is_featured: boolean;
  acteur_name?: string;
  acteur_slug?: string;
}

function formatPrix(p?: number) {
  if (!p) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
}

const DPE_COLORS: Record<string, string> = {
  A: '#00a550', B: '#50b848', C: '#b5d334',
  D: '#fbec00', E: '#f5a623', F: '#e8401c', G: '#cc0000',
};

export default function FavorisPage() {
  const { ids, count, remove } = useFavoris();
  const [biens, setBiens] = useState<BienFavori[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ids.length) { setBiens([]); return; }
    setLoading(true);
    fetch(`/api/biens/favoris?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(d => setBiens(d.biens ?? []))
      .catch(() => setBiens([]))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1626 0%, #0d2240 100%)',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '3rem 1.5rem 1.5rem',
      }}>
        <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '.875rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
          ← Retour à la carte
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48,
            background: 'rgba(239,68,68,.15)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>❤️</div>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Mes favoris
            </h1>
            <p style={{ color: '#64748b', fontSize: '.9rem', margin: '4px 0 0' }}>
              {count === 0 ? 'Aucun bien sauvegardé' : `${count} bien${count > 1 ? 's' : ''} sauvegardé${count > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* État vide */}
        {!loading && count === 0 && (
          <div style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 20,
            padding: '4rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 700, marginBottom: '.5rem' }}>
              Vous n&apos;avez pas encore de favoris
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Explorez la carte et cliquez sur ❤️ pour sauvegarder les biens qui vous intéressent.
            </p>
            <Link href="/?ouvre-carte=1" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '.95rem',
            }}>
              Explorer la carte
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#38bdf8' }}>
            Chargement de vos favoris…
          </div>
        )}

        {/* Grille des biens */}
        {!loading && biens.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {biens.map(bien => (
              <div key={bien.id} style={{
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'transform .15s, box-shadow .15s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Photo */}
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0d2240', overflow: 'hidden' }}>
                  {bien.photos?.[0] ? (
                    <img
                      src={bien.photos[0].url}
                      alt={bien.titre ?? bien.type_bien}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#1e3a5f' }}>
                      🏡
                    </div>
                  )}
                  {/* Badge type */}
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: bien.type_annonce === 'vente' ? 'rgba(99,102,241,.9)' : 'rgba(16,185,129,.9)',
                    color: '#fff', fontSize: '.7rem', fontWeight: 700,
                    padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '.05em',
                  }}>
                    {bien.type_annonce === 'vente' ? 'Vente' : 'Location'}
                  </div>
                  {/* DPE */}
                  {bien.dpe && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: DPE_COLORS[bien.dpe] ?? '#888',
                      color: '#fff', fontSize: '.7rem', fontWeight: 800,
                      width: 24, height: 24, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {bien.dpe}
                    </div>
                  )}
                  {/* Bouton retirer */}
                  <button
                    onClick={() => remove(bien.id)}
                    title="Retirer des favoris"
                    style={{
                      position: 'absolute', bottom: 10, right: 10,
                      background: 'rgba(239,68,68,.85)',
                      backdropFilter: 'blur(4px)',
                      border: 'none', borderRadius: 8,
                      width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '1rem',
                      transition: 'transform .1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    ❤️
                  </button>
                </div>

                {/* Infos */}
                <div style={{ padding: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {bien.commune} · {bien.type_bien}
                  </p>
                  <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {bien.titre ?? `${bien.type_bien} ${bien.commune}`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem' }}>
                      {formatPrix(bien.prix)}
                      {bien.type_annonce === 'location' && <span style={{ fontSize: '.75rem', fontWeight: 400, color: '#64748b' }}>/mois</span>}
                    </span>
                    {bien.surface && (
                      <span style={{ color: '#64748b', fontSize: '.85rem' }}>{bien.surface} m²</span>
                    )}
                    {bien.pieces && (
                      <span style={{ color: '#64748b', fontSize: '.85rem' }}>{bien.pieces} pièces</span>
                    )}
                  </div>
                  {bien.acteur_name && (
                    <p style={{ color: '#475569', fontSize: '.75rem', marginBottom: 12 }}>
                      {bien.acteur_name}
                    </p>
                  )}
                  <Link href={`/bien/${bien.id}`} style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'rgba(99,102,241,.15)',
                    border: '1px solid rgba(99,102,241,.3)',
                    color: '#818cf8',
                    textDecoration: 'none',
                    padding: '9px',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: '.875rem',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,.3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,.15)')}
                  >
                    Voir le bien →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Biens supprimés (IDs sans résultat) */}
        {!loading && ids.length > 0 && biens.length < ids.length && (
          <p style={{ color: '#475569', fontSize: '.8rem', textAlign: 'center', marginTop: '1.5rem' }}>
            {ids.length - biens.length} bien{ids.length - biens.length > 1 ? 's' : ''} n&apos;est plus disponible.
          </p>
        )}

        {/* CTA bas de page */}
        {!loading && biens.length > 0 && (
          <div style={{
            marginTop: '3rem',
            background: 'rgba(99,102,241,.08)',
            border: '1px solid rgba(99,102,241,.2)',
            borderRadius: 16,
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <p style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 4px' }}>
                Vous souhaitez être accompagné ?
              </p>
              <p style={{ color: '#64748b', fontSize: '.875rem', margin: 0 }}>
                Nos professionnels locaux du Bassin d&apos;Arcachon vous répondent rapidement.
              </p>
            </div>
            <Link href="/acquereur" style={{
              background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
              color: '#fff',
              textDecoration: 'none',
              padding: '11px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '.9rem',
              whiteSpace: 'nowrap',
            }}>
              Trouver un pro local
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
