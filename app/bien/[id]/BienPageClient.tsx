'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { BienDetail } from './page';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const ANNONCE_CONFIG = {
  vente:      { label: 'Vente',      color: '#f97316', bg: '#fff7ed' },
  location:   { label: 'Location',   color: '#3b82f6', bg: '#eff6ff' },
  viager:     { label: 'Viager',     color: '#8b5cf6', bg: '#f5f3ff' },
  neuf:       { label: 'Neuf',       color: '#22c55e', bg: '#f0fdf4' },
  commercial: { label: 'Commercial', color: '#64748b', bg: '#f8fafc' },
} as Record<string, { label: string; color: string; bg: string }>;

const DPE_COLORS: Record<string, string> = {
  A: '#15803d', B: '#65a30d', C: '#ca8a04', D: '#ea580c',
  E: '#dc2626', F: '#9f1239', G: '#6b21a8',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function BienPageClient({ bien }: { bien: BienDetail }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [copied,      setCopied]      = useState(false);

  const cfg        = ANNONCE_CONFIG[bien.type_annonce] ?? ANNONCE_CONFIG.vente;
  const typeLabel  = bien.type_annonce === 'vente' ? 'à vendre' :
                     bien.type_annonce === 'location' ? 'à louer' : bien.type_annonce;
  const titre      = bien.titre ?? `${bien.type_bien} ${typeLabel} — ${bien.commune}`;
  const hasPhotos  = bien.photos?.length > 0;

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── Breadcrumb / retour ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 20px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.875rem' }}>
          <Link href="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
            ← Carte
          </Link>
          <span style={{ color: '#cbd5e1' }}>›</span>
          <span style={{ color: '#94a3b8' }}>
            {bien.type_bien} {typeLabel}
            {bien.commune ? ` · ${bien.commune}` : ''}
          </span>
          {bien.reference && (
            <>
              <span style={{ color: '#cbd5e1' }}>›</span>
              <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '.8125rem' }}>
                {bien.reference}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 48px' }}>

        {/* ── Photo hero ── */}
        {hasPhotos ? (
          <div style={{
            borderRadius: '20px', overflow: 'hidden', marginBottom: '24px',
            background: '#0f172a', aspectRatio: '16/7',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bien.photos[0].url} alt={titre}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{
            borderRadius: '20px', marginBottom: '24px',
            background: 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 100%)',
            aspectRatio: '16/7',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,.3)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {bien.type_bien === 'Appartement' ? '🏢' :
               bien.type_bien === 'Terrain' ? '🌿' :
               bien.type_bien === 'Commerce' ? '🏪' : '🏡'}
            </div>
            <div style={{ fontSize: '.9375rem' }}>{bien.commune ?? 'Bassin d\'Arcachon'}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}
          className="bien-grid">

          {/* ── Colonne principale ── */}
          <div>

            {/* Header */}
            <div style={{
              background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
              padding: '24px', marginBottom: '16px',
            }}>
              {/* Badge + actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{
                  fontSize: '.8125rem', fontWeight: 700, padding: '4px 12px',
                  borderRadius: '8px', background: cfg.bg, color: cfg.color,
                  letterSpacing: '.05em',
                }}>
                  {cfg.label.toUpperCase()}
                </span>
                <button onClick={copyLink} style={{
                  border: '1.5px solid #e2e8f0', background: 'white', borderRadius: '10px',
                  padding: '6px 14px', fontSize: '.8125rem', color: '#64748b',
                  cursor: 'pointer', fontWeight: 500, minHeight: 'auto',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {copied ? '✓ Copié !' : '🔗 Partager'}
                </button>
              </div>

              {/* Titre */}
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.2 }}>
                {titre}
              </h1>

              {/* Commune */}
              {(bien.adresse || bien.commune) && (
                <p style={{ color: '#64748b', fontSize: '.9375rem', margin: '0 0 16px' }}>
                  📍 {bien.adresse ? `${bien.adresse}, ` : ''}{bien.commune}{bien.code_postal ? ` (${bien.code_postal})` : ''}
                </p>
              )}

              {/* Prix */}
              {bien.prix && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                    {fmt(bien.prix)}
                  </span>
                  {bien.prix_m2 && (
                    <span style={{ fontSize: '.9375rem', color: '#94a3b8' }}>
                      {bien.prix_m2.toLocaleString('fr-FR')} €/m²
                    </span>
                  )}
                  {bien.type_annonce === 'location' && (
                    <span style={{ fontSize: '.9375rem', color: '#94a3b8' }}>/mois</span>
                  )}
                </div>
              )}
            </div>

            {/* Stats rapides */}
            <div style={{
              background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
              padding: '20px', marginBottom: '16px',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px',
            }}>
              {bien.surface && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>{bien.surface}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>m² habitables</div>
                </div>
              )}
              {bien.surface_terrain && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>{bien.surface_terrain}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>m² terrain</div>
                </div>
              )}
              {bien.pieces && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>{bien.pieces}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>pièces</div>
                </div>
              )}
              {bien.chambres && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>{bien.chambres}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>chambres</div>
                </div>
              )}
              {bien.sdb && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>{bien.sdb}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>salle{bien.sdb > 1 ? 's' : ''} de bain</div>
                </div>
              )}
              {bien.annee_construction && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a' }}>{bien.annee_construction}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '2px' }}>année const.</div>
                </div>
              )}
              {bien.dpe && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: DPE_COLORS[bien.dpe] ?? '#94a3b8',
                    color: 'white', fontWeight: 900, fontSize: '1.125rem',
                  }}>{bien.dpe}</div>
                  <div style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: '4px' }}>DPE</div>
                </div>
              )}
            </div>

            {/* Options */}
            {(bien.has_piscine || bien.has_garage || bien.has_terrasse) && (
              <div style={{
                background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
                padding: '20px', marginBottom: '16px',
                display: 'flex', flexWrap: 'wrap', gap: '10px',
              }}>
                {bien.has_piscine  && <span style={optTag}>🏊 Piscine</span>}
                {bien.has_garage   && <span style={optTag}>🚗 Garage</span>}
                {bien.has_terrasse && <span style={optTag}>☀️ Terrasse / jardin</span>}
              </div>
            )}

            {/* Description */}
            {bien.description && (
              <div style={{
                background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
                padding: '24px', marginBottom: '16px',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Description
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
                  {bien.description}
                </p>
              </div>
            )}

            {/* Mini-carte */}
            {bien.lat && bien.lng && (
              <div style={{
                background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
                padding: '20px', marginBottom: '16px',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Localisation
                </h2>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${bien.lat}&mlon=${bien.lng}&zoom=16`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${bien.lat},${bien.lng}&zoom=15&size=800x240&markers=${bien.lat},${bien.lng},red`}
                    alt={`Carte ${bien.commune}`}
                    style={{ width: '100%', borderRadius: '12px', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
                <p style={{ color: '#94a3b8', fontSize: '.8125rem', marginTop: '8px', textAlign: 'center' }}>
                  Ouvrir dans OpenStreetMap →
                </p>
              </div>
            )}

          </div>

          {/* ── Colonne agence (sticky) ── */}
          <div style={{ position: 'sticky', top: '88px' }}>

            {/* Card agence */}
            <div style={{
              background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
              padding: '20px', marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#eef2ff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                }}>🏢</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', lineHeight: 1.2 }}>
                    {bien.acteur_name}
                    {bien.acteur_verified && (
                      <span style={{ marginLeft: '6px', fontSize: '.75rem', color: '#6366f1' }}>✓</span>
                    )}
                  </div>
                  {bien.acteur_commune && (
                    <div style={{ fontSize: '.8125rem', color: '#94a3b8' }}>{bien.acteur_commune}</div>
                  )}
                </div>
              </div>

              {bien.acteur_rating && (
                <div style={{ fontSize: '.875rem', color: '#f59e0b', fontWeight: 700, marginBottom: '14px' }}>
                  ★ {Number(bien.acteur_rating).toFixed(1)}
                  <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '4px', fontSize: '.8125rem' }}>
                    ({bien.acteur_reviews} avis)
                  </span>
                </div>
              )}

              {/* CTA principal */}
              {bien.acteur_phone ? (
                <a href={`tel:${bien.acteur_phone}`} style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: '#6366f1', color: 'white',
                  fontWeight: 700, fontSize: '1rem', padding: '14px',
                  borderRadius: '14px', marginBottom: '8px',
                }}>
                  📞 {bien.acteur_phone}
                </a>
              ) : (
                <button onClick={() => setContactOpen(true)} style={{
                  width: '100%', background: '#6366f1', color: 'white',
                  fontWeight: 700, fontSize: '1rem', padding: '14px',
                  borderRadius: '14px', border: 'none', cursor: 'pointer',
                  marginBottom: '8px', minHeight: 'auto',
                }}>
                  ✉️ Contacter l&apos;agence
                </button>
              )}

              {bien.acteur_email && (
                <a href={`mailto:${bien.acteur_email}?subject=Demande d'info — ${titre}`} style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: '#f8fafc', color: '#334155',
                  fontWeight: 600, fontSize: '.9375rem', padding: '11px',
                  borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '8px',
                }}>
                  ✉️ Envoyer un email
                </a>
              )}

              {bien.acteur_website && (
                <a href={bien.acteur_website} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: '#f8fafc', color: '#64748b',
                  fontWeight: 500, fontSize: '.875rem', padding: '10px',
                  borderRadius: '14px', border: '1.5px solid #e2e8f0',
                }}>
                  Site de l&apos;agence →
                </a>
              )}
            </div>

            {/* Référence */}
            {bien.reference && (
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '10px 14px', fontSize: '.8125rem', color: '#94a3b8', textAlign: 'center' }}>
                Réf. {bien.reference}
              </div>
            )}

            {/* Lien retour carte */}
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <Link href="/?layer=biens" style={{ color: '#6366f1', fontSize: '.875rem', textDecoration: 'none', fontWeight: 500 }}>
                ← Voir tous les biens sur la carte
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modal contact ── */}
      {contactOpen && (
        <div
          onClick={() => setContactOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px', padding: '28px',
              maxWidth: '400px', width: '100%',
            }}
          >
            <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Contacter {bien.acteur_name}
            </h3>
            <p style={{ color: '#64748b', fontSize: '.9375rem', marginBottom: '20px' }}>
              À propos : {titre}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bien.acteur_phone && (
                <a href={`tel:${bien.acteur_phone}`} style={{
                  textAlign: 'center', textDecoration: 'none',
                  background: '#6366f1', color: 'white',
                  fontWeight: 700, padding: '13px', borderRadius: '12px',
                }}>
                  📞 Appeler — {bien.acteur_phone}
                </a>
              )}
              {bien.acteur_email && (
                <a href={`mailto:${bien.acteur_email}?subject=Demande d'info — ${titre}`} style={{
                  textAlign: 'center', textDecoration: 'none',
                  background: '#f8fafc', color: '#334155',
                  fontWeight: 600, padding: '13px', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                }}>
                  ✉️ {bien.acteur_email}
                </a>
              )}
              <button onClick={() => setContactOpen(false)} style={{
                background: 'transparent', border: 'none', color: '#94a3b8',
                fontSize: '.875rem', cursor: 'pointer', padding: '6px', minHeight: 'auto',
              }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 640px) {
          .bien-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

const optTag: CSSProperties = {
  fontSize: '.875rem', fontWeight: 600, color: '#475569',
  background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px',
};
