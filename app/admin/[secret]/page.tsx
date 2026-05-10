'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Acteur {
  id: number; name: string; type: string; slug?: string; plan: string;
  email?: string; phone?: string; commune?: string;
  is_active: boolean; is_verified: boolean; access_token?: string;
  created_at: string; has_stripe: boolean;
}
interface Lead {
  id: number; name: string; email: string; phone?: string;
  commune?: string; source?: string; type_local?: string;
  surface?: number; estimation_centrale?: number; status: string; created_at: string;
}
interface Mandat {
  id: number; prenom?: string; email: string; communes: string[];
  budget_max?: number; mode_financement?: string; accord_bancaire: boolean;
  horizon?: string; is_active: boolean; created_at: string;
}
interface Stats {
  planStats: { plan: string; nb: number; actifs: number }[];
  recentLeads: number;
  mandatsCount: number;
  biensCount: number;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });

const PLAN_COLOR: Record<string, string> = {
  free: '#64748b', pro: '#6366f1', premium: '#f59e0b',
};

// ─── Admin Panel ─────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { secret } = useParams<{ secret: string }>();

  const [tab, setTab]         = useState<'stats' | 'acteurs' | 'leads' | 'mandats'>('stats');
  const [filter, setFilter]   = useState('pending');
  const [stats, setStats]     = useState<Stats | null>(null);
  const [acteurs, setActeurs] = useState<Acteur[]>([]);
  const [acteursTotal, setActeursTotal] = useState(0);
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth]       = useState<boolean | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const api = useCallback(async (action: string, extra = '') => {
    const res = await fetch(`/api/admin?secret=${secret}&action=${action}${extra}`);
    if (res.status === 401) { setAuth(false); return null; }
    setAuth(true);
    return res.json();
  }, [secret]);

  const post = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, ...body }),
    });
    return res.json();
  }, [secret]);

  // Charger les données selon l'onglet
  useEffect(() => {
    setLoading(true);
    (async () => {
      if (tab === 'stats') {
        const d = await api('stats'); if (d) setStats(d);
      } else if (tab === 'acteurs') {
        const d = await api('acteurs', `&filter=${filter}`);
        if (d) { setActeurs(d.acteurs); setActeursTotal(d.total); }
      } else if (tab === 'leads') {
        const d = await api('leads'); if (d) setLeads(d.leads);
      } else if (tab === 'mandats') {
        const d = await api('mandats'); if (d) setMandats(d.mandats);
      }
      setLoading(false);
    })();
  }, [tab, filter, api]);

  const doAction = async (action: string, params: Record<string, unknown>, msg: string) => {
    setActionMsg('');
    const d = await post({ action, ...params });
    if (d?.ok) {
      setActionMsg(`✅ ${msg}`);
      setTimeout(() => setActionMsg(''), 3000);
      // Recharge
      const d2 = await api('acteurs', `&filter=${filter}`);
      if (d2) { setActeurs(d2.acteurs); setActeursTotal(d2.total); }
    } else {
      setActionMsg(`❌ ${d?.error ?? 'Erreur'}`);
    }
  };

  // ── Auth check ─────────────────────────────────────────────────────────────
  if (auth === false) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Accès refusé</h1>
          <p style={{ color: 'rgba(255,255,255,.5)', marginTop: 8 }}>Secret incorrect ou non configuré.</p>
        </div>
      </div>
    );
  }

  const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,.06)', verticalAlign: 'middle' };
  const th: React.CSSProperties = { ...td, fontWeight: 700, color: 'rgba(255,255,255,.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          Terri<span style={{ color: '#38bdf8' }}>mo</span>{' '}
          <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,.4)' }}>Admin</span>
        </div>
        {actionMsg && (
          <div style={{ fontSize: 14, padding: '6px 14px', borderRadius: 8, background: actionMsg.startsWith('✅') ? 'rgba(134,239,172,.1)' : 'rgba(239,68,68,.1)', color: actionMsg.startsWith('✅') ? '#86efac' : '#fca5a5' }}>
            {actionMsg}
          </div>
        )}
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 24px' }}>
        {(['stats', 'acteurs', 'leads', 'mandats'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
            color: tab === t ? '#38bdf8' : 'rgba(255,255,255,.45)',
            fontWeight: tab === t ? 700 : 400, fontSize: 14,
            borderBottom: tab === t ? '2px solid #38bdf8' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1200 }}>

        {loading && <div style={{ color: 'rgba(255,255,255,.4)', padding: 40, textAlign: 'center' }}>Chargement…</div>}

        {/* ── STATS ──────────────────────────────────────────────────────────── */}
        {tab === 'stats' && stats && !loading && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Biens actifs', value: stats.biensCount, color: '#38bdf8' },
                { label: 'Leads 7 jours', value: stats.recentLeads, color: '#86efac' },
                { label: 'Mandats actifs', value: stats.mandatsCount, color: '#fcd34d' },
                { label: 'Acteurs total', value: stats.planStats.reduce((s, p) => s + p.nb, 0), color: '#c4b5fd' },
              ].map(k => (
                <div key={k.label} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: k.color }}>{k.value.toLocaleString('fr-FR')}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Plans breakdown */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,.08)' }}>Acteurs par plan</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Plan</th>
                    <th style={th}>Total</th>
                    <th style={th}>Actifs</th>
                    <th style={th}>En attente</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.planStats.map(p => (
                    <tr key={p.plan}>
                      <td style={td}>
                        <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: `${PLAN_COLOR[p.plan]}22`, color: PLAN_COLOR[p.plan] }}>
                          {p.plan.toUpperCase()}
                        </span>
                      </td>
                      <td style={td}>{p.nb}</td>
                      <td style={{ ...td, color: '#86efac' }}>{p.actifs}</td>
                      <td style={{ ...td, color: '#fcd34d' }}>{p.nb - p.actifs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ACTEURS ────────────────────────────────────────────────────────── */}
        {tab === 'acteurs' && !loading && (
          <>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[
                { v: 'pending', l: '⏳ En attente' },
                { v: 'active',  l: '✅ Actifs' },
                { v: 'premium', l: '⭐ Pro/Premium' },
                { v: 'all',     l: '📋 Tous' },
              ].map(f => (
                <button key={f.v} onClick={() => setFilter(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid',
                  borderColor: filter === f.v ? '#38bdf8' : 'rgba(255,255,255,.15)',
                  background: filter === f.v ? 'rgba(56,189,248,.1)' : 'transparent',
                  color: filter === f.v ? '#7dd3fc' : 'rgba(255,255,255,.6)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>
                  {f.l}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: '32px' }}>
                {acteursTotal} résultat{acteursTotal > 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Acteur</th>
                    <th style={th}>Type</th>
                    <th style={th}>Plan</th>
                    <th style={th}>Commune</th>
                    <th style={th}>Contact</th>
                    <th style={th}>Créé</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {acteurs.map(a => (
                    <tr key={a.id} style={{ opacity: a.is_active ? 1 : 0.7 }}>
                      <td style={td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                          #{a.id} {a.has_stripe && '💳'} {a.is_verified && '✅'}
                        </div>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{a.type}</span>
                      </td>
                      <td style={td}>
                        <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: `${PLAN_COLOR[a.plan] ?? '#64748b'}22`, color: PLAN_COLOR[a.plan] ?? '#64748b' }}>
                          {a.plan}
                        </span>
                      </td>
                      <td style={{ ...td, fontSize: 12 }}>{a.commune ?? '—'}</td>
                      <td style={td}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{a.email ?? '—'}</div>
                        {a.phone && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{a.phone}</div>}
                      </td>
                      <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{fmtDate(a.created_at)}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {/* Activer / désactiver */}
                          <button
                            onClick={() => doAction('set_active', { acteur_id: a.id, value: !a.is_active }, a.is_active ? `${a.name} désactivé` : `${a.name} activé + email envoyé`)}
                            style={{
                              padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              background: a.is_active ? 'rgba(239,68,68,.15)' : 'rgba(134,239,172,.15)',
                              color: a.is_active ? '#fca5a5' : '#86efac',
                            }}>
                            {a.is_active ? '⏸ Désactiver' : '▶ Activer'}
                          </button>

                          {/* Vérifier */}
                          {!a.is_verified && (
                            <button
                              onClick={() => doAction('set_verified', { acteur_id: a.id, value: true }, `${a.name} vérifié`)}
                              style={{ padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: 'rgba(56,189,248,.15)', color: '#7dd3fc' }}>
                              ✓ Vérifier
                            </button>
                          )}

                          {/* Dashboard link */}
                          {a.access_token && (
                            <a href={`/pro/dashboard/${a.access_token}`} target="_blank" rel="noreferrer"
                              style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>
                              ↗
                            </a>
                          )}

                          {/* Plan override */}
                          <select
                            value={a.plan}
                            onChange={e => doAction('set_plan', { acteur_id: a.id, value: e.target.value }, `${a.name} → plan ${e.target.value}`)}
                            style={{ padding: '4px 6px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: '#0a1628', color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer' }}>
                            <option value="free">free</option>
                            <option value="pro">pro</option>
                            <option value="premium">premium</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {acteurs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ ...td, textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 40 }}>
                        Aucun acteur dans ce filtre
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── LEADS ──────────────────────────────────────────────────────────── */}
        {tab === 'leads' && !loading && (
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', fontWeight: 700 }}>
              {leads.length} leads récents
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Contact</th>
                  <th style={th}>Commune</th>
                  <th style={th}>Source</th>
                  <th style={th}>Bien</th>
                  <th style={th}>Estimation</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{l.email}</div>
                      {l.phone && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{l.phone}</div>}
                    </td>
                    <td style={{ ...td, fontSize: 13 }}>{l.commune ?? '—'}</td>
                    <td style={td}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.55)' }}>
                        {l.source ?? 'evaluer'}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                      {l.type_local ?? '—'} {l.surface ? `· ${l.surface} m²` : ''}
                    </td>
                    <td style={{ ...td, fontSize: 13, color: '#fcd34d', fontWeight: 600 }}>
                      {l.estimation_centrale ? fmt(l.estimation_centrale) : '—'}
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{fmtDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── MANDATS ────────────────────────────────────────────────────────── */}
        {tab === 'mandats' && !loading && (
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', fontWeight: 700 }}>
              {mandats.length} mandats récents
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Acquéreur</th>
                  <th style={th}>Communes</th>
                  <th style={th}>Budget</th>
                  <th style={th}>Financement</th>
                  <th style={th}>Horizon</th>
                  <th style={th}>Actif</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {mandats.map(m => (
                  <tr key={m.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.prenom ?? '—'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{m.email}</div>
                    </td>
                    <td style={{ ...td, fontSize: 12 }}>{(m.communes ?? []).join(', ')}</td>
                    <td style={{ ...td, fontSize: 13, color: '#fcd34d', fontWeight: 600 }}>
                      {m.budget_max ? fmt(m.budget_max) : '—'}
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 12, color: m.mode_financement === 'comptant' ? '#86efac' : 'rgba(255,255,255,.55)' }}>
                        {m.mode_financement ?? '—'} {m.accord_bancaire ? '✅' : ''}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{m.horizon ?? '—'}</td>
                    <td style={td}>
                      <span style={{ fontSize: 12, color: m.is_active ? '#86efac' : '#fca5a5' }}>
                        {m.is_active ? '✅' : '❌'}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{fmtDate(m.created_at)}</td>
                  </tr>
                ))}
                {mandats.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...td, textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 40 }}>
                      Aucun mandat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
