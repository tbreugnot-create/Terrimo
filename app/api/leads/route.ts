/**
 * TERRIMO — API Leads
 * POST /api/leads
 *
 * Enregistre un lead depuis /evaluer (ou carte, fiche quartier).
 * Sauvegarde les données d'estimation + sync Odoo CRM (crm.lead).
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface LeadRequest {
  // Contact
  name:     string;
  email:    string;
  phone?:   string;
  // Contexte
  commune?: string;
  source?:  string;
  message?: string;
  agency_id?: string;
  // Données estimation (snapshot)
  estimation_min?:      number;
  estimation_centrale?: number;
  estimation_max?:      number;
  prix_m2_final?:       number;
  surface?:             number;
  type_local?:          string;
  zone_label?:          string;
}

// ─────────────────────────────────────────────────────────────
// Sync Odoo crm.lead (fire & forget)
// ─────────────────────────────────────────────────────────────
async function syncLeadToOdoo(lead: LeadRequest, leadId: number): Promise<number | null> {
  const url     = process.env.ODOO_URL     ?? 'https://empploy.odoo.com';
  const db      = process.env.ODOO_DB      ?? 'empploy';
  const login   = process.env.ODOO_LOGIN   ?? '';
  const api_key = process.env.ODOO_API_KEY ?? '';
  if (!api_key) return null;

  try {
    const xmlRpc = async (endpoint: string, method: string, params: unknown[]) => {
      const body = `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params>${
        params.map(p => `<param><value>${toXml(p)}</value></param>`).join('')
      }</params></methodCall>`;
      const res = await fetch(`${url}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'text/xml' }, body,
      });
      return parseXml(await res.text());
    };

    const uid = await xmlRpc('/xmlrpc/2/common', 'authenticate', [db, login, api_key, {}]);
    if (!uid) return null;

    const estimLine = lead.estimation_centrale
      ? `\n\n💰 Estimation Terrimo : ${formatEur(lead.estimation_min ?? 0)} – ${formatEur(lead.estimation_max ?? 0)}`
        + `\n   Valeur centrale : ${formatEur(lead.estimation_centrale)}`
        + `\n   Prix/m² : ${lead.prix_m2_final ?? '?'} €/m²`
      : '';

    const description =
      `[Terrimo Lead #${leadId}]`
      + `\nSource : ${lead.source ?? 'evaluer'}`
      + (lead.commune ? `\nCommune : ${lead.commune}` : '')
      + (lead.type_local ? `\nBien : ${lead.type_local} ${lead.surface ? `– ${lead.surface} m²` : ''}` : '')
      + (lead.zone_label ? `\nZone : ${lead.zone_label}` : '')
      + estimLine
      + (lead.message ? `\n\n💬 Message : ${lead.message}` : '');

    const vals: Record<string, unknown> = {
      name:         `🏡 ${lead.name} — ${lead.commune ?? 'Bassin d\'Arcachon'}`,
      contact_name: lead.name,
      email_from:   lead.email,
      description,
      type:         'lead',
      tag_ids:      [[4, 0, []]], // pas de tags pour l'instant
    };
    if (lead.phone) vals.phone = lead.phone;

    const odooId = await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      db, uid, api_key, 'crm.lead', 'create', [vals], {},
    ]);

    return typeof odooId === 'number' ? odooId : null;
  } catch (e) {
    console.error('Odoo lead sync error:', e);
    return null;
  }
}

function formatEur(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function toXml(val: unknown): string {
  if (val === null || val === undefined) return '<nil/>';
  if (typeof val === 'boolean') return `<boolean>${val ? 1 : 0}</boolean>`;
  if (typeof val === 'number') return Number.isInteger(val) ? `<int>${val}</int>` : `<double>${val}</double>`;
  if (typeof val === 'string') return `<string>${val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</string>`;
  if (Array.isArray(val)) return `<array><data>${val.map(v=>`<value>${toXml(v)}</value>`).join('')}</data></array>`;
  if (typeof val === 'object') {
    const m = Object.entries(val as Record<string,unknown>)
      .map(([k,v])=>`<member><name>${k}</name><value>${toXml(v)}</value></member>`).join('');
    return `<struct>${m}</struct>`;
  }
  return `<string>${String(val)}</string>`;
}

function parseXml(xml: string): unknown {
  const n = xml.match(/<int>(\d+)<\/int>/);  if (n) return parseInt(n[1]);
  const b = xml.match(/<boolean>(\d)<\/boolean>/); if (b) return b[1]==='1';
  const s = xml.match(/<string>([\s\S]*?)<\/string>/); if (s) return s[1];
  return null;
}

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: LeadRequest = await request.json();
    const {
      name, email, phone, commune, source = 'evaluer', message, agency_id,
      estimation_min, estimation_centrale, estimation_max,
      prix_m2_final, surface, type_local, zone_label,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Sauvegarder en base avec toutes les données estimation
    const rows = await sql`
      INSERT INTO leads (
        name, email, phone, commune, source, message, agency_id,
        estimation_min, estimation_centrale, estimation_max,
        prix_m2_final, surface, type_local, zone_label
      ) VALUES (
        ${name}, ${email}, ${phone ?? null}, ${commune ?? null},
        ${source}, ${message ?? null}, ${agency_id ?? null},
        ${estimation_min ?? null}, ${estimation_centrale ?? null}, ${estimation_max ?? null},
        ${prix_m2_final ?? null}, ${surface ?? null}, ${type_local ?? null}, ${zone_label ?? null}
      )
      RETURNING id, created_at
    `;

    const leadId = rows[0].id as number;

    // Sync Odoo CRM (asynchrone — ne bloque pas la réponse)
    syncLeadToOdoo(body, leadId)
      .then(odooId => {
        if (odooId) {
          // Mise à jour silencieuse de l'odoo_lead_id
          sql`UPDATE leads SET odoo_lead_id = ${odooId} WHERE id = ${leadId}`.catch(() => {});
        }
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      message: 'Votre demande a été enregistrée. Une agence vous contactera sous 24h.',
    });

  } catch (error) {
    console.error('Erreur /api/leads:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
