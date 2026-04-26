/**
 * TERRIMO — Odoo XML-RPC helper partagé
 * Gère : contacts (res.partner) + tags (res.partner.category) + leads CRM
 */

const ODOO_URL     = process.env.ODOO_URL     ?? 'https://empploy.odoo.com';
const ODOO_DB      = process.env.ODOO_DB      ?? 'empploy';
const ODOO_LOGIN   = process.env.ODOO_LOGIN   ?? '';
const ODOO_API_KEY = process.env.ODOO_API_KEY ?? '';

// ─── XML-RPC minimal ─────────────────────────────────────
function jsonToXml(val: unknown): string {
  if (val === null || val === undefined) return '<nil/>';
  if (typeof val === 'boolean') return `<boolean>${val ? 1 : 0}</boolean>`;
  if (typeof val === 'number') return Number.isInteger(val) ? `<int>${val}</int>` : `<double>${val}</double>`;
  if (typeof val === 'string') return `<string>${val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string>`;
  if (Array.isArray(val)) return `<array><data>${val.map(v => `<value>${jsonToXml(v)}</value>`).join('')}</data></array>`;
  if (typeof val === 'object') {
    const members = Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => `<member><name>${k}</name><value>${jsonToXml(v)}</value></member>`)
      .join('');
    return `<struct>${members}</struct>`;
  }
  return `<string>${String(val)}</string>`;
}

function parseXml(xml: string): unknown {
  const intMatch = xml.match(/<int>(\d+)<\/int>/);
  if (intMatch) return parseInt(intMatch[1]);
  const boolMatch = xml.match(/<boolean>(\d)<\/boolean>/);
  if (boolMatch) return boolMatch[1] === '1';
  const strMatch = xml.match(/<string>([\s\S]*?)<\/string>/);
  if (strMatch) return strMatch[1];
  if (xml.includes('<array>')) {
    const idMatches = [...xml.matchAll(/<name>id<\/name>\s*<value>\s*<int>(\d+)<\/int>/g)];
    return idMatches.map(m => ({ id: parseInt(m[1]) }));
  }
  return null;
}

async function xmlRpc(endpoint: string, method: string, params: unknown[]): Promise<unknown> {
  const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${params.map(p => `<param><value>${jsonToXml(p)}</value></param>`).join('\n    ')}
  </params>
</methodCall>`;
  const res = await fetch(`${ODOO_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body,
  });
  return parseXml(await res.text());
}

// ─── Auth ─────────────────────────────────────────────────
async function getUid(): Promise<number | null> {
  if (!ODOO_API_KEY) return null;
  const uid = await xmlRpc('/xmlrpc/2/common', 'authenticate', [ODOO_DB, ODOO_LOGIN, ODOO_API_KEY, {}]);
  return typeof uid === 'number' ? uid : null;
}

// ─── Tags (res.partner.category) ─────────────────────────
async function getOrCreateTag(uid: number, tagName: string): Promise<number | null> {
  // Chercher le tag existant
  const existing = await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
    ODOO_DB, uid, ODOO_API_KEY,
    'res.partner.category', 'search_read',
    [[['name', '=', tagName]]],
    { fields: ['id'], limit: 1 },
  ]) as Array<{ id: number }>;

  if (existing?.length) return existing[0].id;

  // Créer le tag
  const newId = await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
    ODOO_DB, uid, ODOO_API_KEY,
    'res.partner.category', 'create',
    [{ name: tagName }],
    {},
  ]);
  return typeof newId === 'number' ? newId : null;
}

// ─── Contact acquéreur ────────────────────────────────────
export interface AcquereurOdoo {
  prenom?: string;
  email: string;
  phone?: string;
  communes?: string[];
  budget_max?: number | null;
  type_acquisition?: string;
  horizon?: string;
  mode_financement?: string;
  accord_bancaire?: boolean;
  description?: string;
  mandatNeonId?: number;
}

export async function syncAcquereurToOdoo(data: AcquereurOdoo): Promise<void> {
  if (!ODOO_API_KEY) return;
  try {
    const uid = await getUid();
    if (!uid) return;

    // Tags à appliquer
    const tagNames = ['Terrimo — Acquéreur'];
    if (data.type_acquisition === 'résidence_principale') tagNames.push('Terrimo — Résidence principale');
    else if (data.type_acquisition === 'résidence_secondaire') tagNames.push('Terrimo — Résidence secondaire');
    else if (data.type_acquisition === 'investissement') tagNames.push('Terrimo — Investissement');
    if (data.accord_bancaire) tagNames.push('Terrimo — Financement confirmé');

    const tagIds = (await Promise.all(tagNames.map(t => getOrCreateTag(uid, t)))).filter(Boolean) as number[];

    const budgetStr = data.budget_max
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.budget_max)
      : '—';

    const comment = [
      `[Terrimo] Acquéreur — Bassin d'Arcachon`,
      `Communes : ${(data.communes ?? []).join(', ')}`,
      `Budget max : ${budgetStr}`,
      `Horizon : ${data.horizon ?? '—'}`,
      `Financement : ${data.mode_financement ?? '—'}`,
      data.description ? `Note : "${data.description}"` : '',
      data.mandatNeonId ? `Mandat Neon ID : ${data.mandatNeonId}` : '',
    ].filter(Boolean).join('\n');

    const vals: Record<string, unknown> = {
      name:       data.prenom ?? data.email,
      is_company: false,
      email:      data.email,
      comment,
      category_id: [[6, 0, tagIds]], // many2many replace
      country_id: 75, // France
    };
    if (data.phone) vals.phone = data.phone;

    // Chercher contact existant
    const existing = await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'res.partner', 'search_read',
      [[['email', '=', data.email]]],
      { fields: ['id'], limit: 1 },
    ]) as Array<{ id: number }>;

    if (existing?.length) {
      await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
        ODOO_DB, uid, ODOO_API_KEY,
        'res.partner', 'write',
        [[existing[0].id], vals],
        {},
      ]);
    } else {
      await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
        ODOO_DB, uid, ODOO_API_KEY,
        'res.partner', 'create',
        [vals],
        {},
      ]);
    }
  } catch (err) {
    console.error('[syncAcquereurToOdoo]', err);
  }
}

// ─── Contact vendeur/propriétaire ────────────────────────
export interface VendeurOdoo {
  email: string;
  commune?: string;
  type_bien?: string;
  surface?: number | null;
  estimation?: number | null;
  intention?: string; // vendre | louer | diagnostiquer | notaire
  leadNeonId?: number;
}

export async function syncVendeurToOdoo(data: VendeurOdoo): Promise<void> {
  if (!ODOO_API_KEY) return;
  try {
    const uid = await getUid();
    if (!uid) return;

    const tagNames = ['Terrimo — Propriétaire'];
    if (data.intention === 'vendre') tagNames.push('Terrimo — Vendeur');
    else if (data.intention === 'louer') tagNames.push('Terrimo — Bailleur');
    else if (data.intention === 'diagnostiquer') tagNames.push('Terrimo — DPE');
    else if (data.intention === 'notaire') tagNames.push('Terrimo — Notaire');

    const tagIds = (await Promise.all(tagNames.map(t => getOrCreateTag(uid, t)))).filter(Boolean) as number[];

    const estStr = data.estimation
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.estimation)
      : '—';

    const comment = [
      `[Terrimo] Propriétaire — ${data.commune ?? 'Bassin d\'Arcachon'}`,
      `Bien : ${data.type_bien ?? '—'} ${data.surface ? `— ${data.surface} m²` : ''}`,
      `Estimation : ${estStr}`,
      `Intention : ${data.intention ?? '—'}`,
      data.leadNeonId ? `Lead Neon ID : ${data.leadNeonId}` : '',
    ].filter(Boolean).join('\n');

    const vals: Record<string, unknown> = {
      name:        data.email,
      is_company:  false,
      email:       data.email,
      comment,
      category_id: [[6, 0, tagIds]],
      country_id:  75,
    };

    const existing = await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'res.partner', 'search_read',
      [[['email', '=', data.email]]],
      { fields: ['id'], limit: 1 },
    ]) as Array<{ id: number }>;

    if (existing?.length) {
      await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
        ODOO_DB, uid, ODOO_API_KEY,
        'res.partner', 'write',
        [[existing[0].id], vals],
        {},
      ]);
    } else {
      await xmlRpc('/xmlrpc/2/object', 'execute_kw', [
        ODOO_DB, uid, ODOO_API_KEY,
        'res.partner', 'create',
        [vals],
        {},
      ]);
    }
  } catch (err) {
    console.error('[syncVendeurToOdoo]', err);
  }
}
