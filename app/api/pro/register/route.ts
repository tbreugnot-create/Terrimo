/**
 * TERRIMO — POST /api/pro/register
 * Self-onboarding professionnel :
 *  - Crée ou met à jour l'acteur dans Neon
 *  - Crée/met à jour le contact dans Odoo
 *  - Retourne confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { emailProMagicLink } from '@/lib/email';

interface RegisterBody {
  type:           string;
  name:           string;
  email:          string;
  phone?:         string;
  website?:       string;
  address?:       string;
  commune:        string;
  plan:           'free' | 'pro' | 'premium';
  contact_nom:    string;
  contact_prenom: string;
  contact_poste?: string;
  existing_id?:   number | null;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function syncToOdoo(data: RegisterBody, neonId: number): Promise<void> {
  const url     = process.env.ODOO_URL    ?? 'https://empploy.odoo.com';
  const db      = process.env.ODOO_DB     ?? 'empploy';
  const login   = process.env.ODOO_LOGIN  ?? '';
  const api_key = process.env.ODOO_API_KEY ?? '';

  if (!api_key) return; // Pas de config Odoo — on skip silencieusement

  // Odoo XML-RPC via fetch (pas de lib native côté edge/serverless)
  const xmlRpc = async (endpoint: string, method: string, params: unknown[]) => {
    const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${params.map(p => `<param><value>${jsonToXml(p)}</value></param>`).join('\n    ')}
  </params>
</methodCall>`;

    const res = await fetch(`${url}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body,
    });
    const text = await res.text();
    return parseXmlRpcResponse(text);
  };

  const uid = await xmlRpc('/xmlrpc/2/common', 'authenticate', [db, login, api_key, {}]);
  if (!uid) return;

  const TYPE_LABEL: Record<string, string> = {
    agence: 'Agence immobilière',
    notaire: 'Notaire',
    diagnostiqueur: 'Diagnostiqueur',
  };

  const vals: Record<string, unknown> = {
    name:       data.name,
    is_company: true,
    email:      data.email,
    city:       data.commune ? data.commune.charAt(0).toUpperCase() + data.commune.slice(1).toLowerCase() : '',
    country_id: 75, // France
    comment:    `[Terrimo] Type: ${TYPE_LABEL[data.type] ?? data.type} | Plan: ${data.plan.toUpperCase()}\nContact: ${data.contact_prenom} ${data.contact_nom}${data.contact_poste ? ' — ' + data.contact_poste : ''}\nNeon ID: ${neonId}`,
  };
  if (data.phone)   vals.phone   = data.phone;
  if (data.website) vals.website = data.website.startsWith('http') ? data.website : `https://${data.website}`;
  if (data.address) vals.street  = data.address;

  // Chercher si déjà dans Odoo
  const existing = await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
    db, uid, api_key,
    'res.partner', 'search_read',
    [[['email', '=', data.email]]],
    { fields: ['id'], limit: 1 },
  ]);

  const existingArr = existing as Array<{ id: number }>;
  if (existingArr && existingArr.length > 0) {
    await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      db, uid, api_key,
      'res.partner', 'write',
      [[existingArr[0].id], vals],
      {},
    ]);
  } else {
    await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      db, uid, api_key,
      'res.partner', 'create',
      [vals],
      {},
    ]);
  }
}

// XML-RPC minimal helpers
function jsonToXml(val: unknown): string {
  if (val === null || val === undefined) return '<nil/>';
  if (typeof val === 'boolean') return `<boolean>${val ? 1 : 0}</boolean>`;
  if (typeof val === 'number') return Number.isInteger(val) ? `<int>${val}</int>` : `<double>${val}</double>`;
  if (typeof val === 'string') return `<string>${val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</string>`;
  if (Array.isArray(val)) {
    return `<array><data>${val.map(v => `<value>${jsonToXml(v)}</value>`).join('')}</data></array>`;
  }
  if (typeof val === 'object') {
    const members = Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => `<member><name>${k}</name><value>${jsonToXml(v)}</value></member>`)
      .join('');
    return `<struct>${members}</struct>`;
  }
  return `<string>${String(val)}</string>`;
}

function parseXmlRpcResponse(xml: string): unknown {
  // Extrait la valeur de <methodResponse><params><param><value>…</value></param></params></methodResponse>
  // Parser minimaliste — suffit pour int, boolean, string
  const intMatch = xml.match(/<int>(\d+)<\/int>/);
  if (intMatch) return parseInt(intMatch[1]);
  const boolMatch = xml.match(/<boolean>(\d)<\/boolean>/);
  if (boolMatch) return boolMatch[1] === '1';
  const strMatch = xml.match(/<string>([\s\S]*?)<\/string>/);
  if (strMatch) return strMatch[1];
  // Array of structs (search_read result)
  if (xml.includes('<array>')) {
    const idMatches = [...xml.matchAll(/<name>id<\/name>\s*<value>\s*<int>(\d+)<\/int>/g)];
    return idMatches.map(m => ({ id: parseInt(m[1]) }));
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: RegisterBody = await request.json();
    const { type, name, email, phone, website, address, commune, plan,
            contact_nom, contact_prenom, contact_poste, existing_id } = body;

    // Validation
    if (!type || !name || !email || !commune) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    if (!['agence','notaire','diagnostiqueur'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }
    if (!['free','pro','premium'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    let acteurId: number;

    if (existing_id) {
      // ── Mise à jour d'un acteur existant ──────────────────
      const rows = await sql`
        UPDATE acteurs SET
          email       = COALESCE(NULLIF(${email}, ''), email),
          phone       = COALESCE(NULLIF(${phone ?? ''}, ''), phone),
          website     = COALESCE(NULLIF(${website ?? ''}, ''), website),
          address     = COALESCE(NULLIF(${address ?? ''}, ''), address),
          plan        = ${plan},
          meta        = meta || ${JSON.stringify({
            contact_nom,
            contact_prenom,
            contact_poste: contact_poste ?? '',
            self_registered: true,
            registered_at: new Date().toISOString(),
          })}::jsonb,
          updated_at  = NOW()
        WHERE id = ${existing_id}
        RETURNING id
      `;
      acteurId = rows[0].id;
    } else {
      // ── Création d'un nouvel acteur ────────────────────────
      const slug = slugify(name);
      const rows = await sql`
        INSERT INTO acteurs (type, name, slug, email, phone, website, address, commune, plan, meta, is_active)
        VALUES (
          ${type}, ${name},
          ${slug},
          ${email},
          ${phone ?? ''},
          ${website ?? ''},
          ${address ?? ''},
          ${commune},
          ${plan},
          ${JSON.stringify({
            contact_nom,
            contact_prenom,
            contact_poste: contact_poste ?? '',
            self_registered: true,
            registered_at: new Date().toISOString(),
          })}::jsonb,
          false
        )
        ON CONFLICT (slug) DO UPDATE SET
          email      = EXCLUDED.email,
          phone      = EXCLUDED.phone,
          plan       = EXCLUDED.plan,
          updated_at = NOW()
        RETURNING id
      `;
      acteurId = rows[0].id;
    }

    // Sync Odoo (fire & forget)
    syncToOdoo(body, acteurId).catch(err =>
      console.error('Odoo sync error (non-bloquant):', err)
    );

    // Récupérer le token d'accès généré par la migration
    const tokenRows = await sql`SELECT access_token FROM acteurs WHERE id = ${acteurId}`;
    const token = tokenRows[0]?.access_token as string | null;

    // Email magic link au pro
    if (token) {
      emailProMagicLink({
        pro_email: email,
        pro_name:  name,
        plan,
        token,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      id: acteurId,
      message: `Votre fiche a été enregistrée. Elle sera visible après validation.`,
      dashboard_url: token ? `/pro/dashboard/${token}` : null,
    });

  } catch (error) {
    console.error('Erreur /api/pro/register:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
