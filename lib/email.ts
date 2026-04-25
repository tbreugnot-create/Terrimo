/**
 * TERRIMO — Module email via Resend API
 * Pas de dépendance npm — appel HTTP direct.
 * Si RESEND_API_KEY absent → log seulement (pas d'erreur).
 */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM       = 'Terrimo <notifications@terrimo.homes>';
const ADMIN_EMAIL = 'tbreugnot@di-africa.com';

interface EmailPayload {
  to:      string | string[];
  subject: string;
  html:    string;
  replyTo?: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log('[Email skipped — no RESEND_API_KEY]', payload.subject, '→', payload.to);
    return false;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, ...payload }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[Email error]', err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Email fetch error]', e);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 1. Confirmation au propriétaire qui soumet un lead
// ─────────────────────────────────────────────────────────────
export async function emailLeadConfirmation(params: {
  name:    string;
  email:   string;
  commune: string;
  estimation_min?: number;
  estimation_max?: number;
  type_local?: string;
  surface?: number;
}) {
  const { name, email, commune, estimation_min, estimation_max, type_local, surface } = params;
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return sendEmail({
    to:      email,
    subject: `Votre estimation Terrimo — ${commune}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Terrimo</h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px">Bassin d'Arcachon</p>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #e2e8f0;border-top:none">
          <p style="font-size:15px">Bonjour <strong>${name}</strong>,</p>
          <p>Votre demande d'estimation a bien été reçue. Une agence locale du Bassin d'Arcachon va vous contacter <strong>dans les 24h</strong> pour affiner cette estimation avec une visite.</p>

          ${estimation_min && estimation_max ? `
          <div style="background:#f1f5f9;border-radius:8px;padding:16px 20px;margin:20px 0">
            <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;font-weight:700">Votre estimation Terrimo</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#4f46e5">${fmt(estimation_min)} – ${fmt(estimation_max)}</p>
            ${type_local ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b">${type_local}${surface ? ` · ${surface} m²` : ''} · ${commune}</p>` : ''}
          </div>` : ''}

          <p style="font-size:13px;color:#64748b">Cette fourchette est basée sur les données DVF et les prix de marché 2024-2025 du Bassin d'Arcachon. Elle sera affinée lors de la visite par l'agence.</p>
        </div>
        <div style="padding:16px 32px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;font-size:11px;color:#94a3b8;text-align:center">
          Terrimo · Bassin d'Arcachon · <a href="https://terrimo.homes" style="color:#4f46e5">terrimo.homes</a>
        </div>
      </div>`,
  });
}

// ─────────────────────────────────────────────────────────────
// 2. Alerte admin (Thomas) — nouveau lead
// ─────────────────────────────────────────────────────────────
export async function emailAdminNewLead(params: {
  lead_id:   number;
  name:      string;
  email:     string;
  phone?:    string;
  commune?:  string;
  type_local?: string;
  surface?:  number;
  estimation_centrale?: number;
}) {
  const { lead_id, name, email, phone, commune, type_local, surface, estimation_centrale } = params;
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return sendEmail({
    to:      ADMIN_EMAIL,
    subject: `🏡 Nouveau lead #${lead_id} — ${name} (${commune ?? 'Bassin'})`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
        <h2 style="color:#4f46e5">🏡 Nouveau lead Terrimo #${lead_id}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748b;width:120px">Nom</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:6px 0;color:#64748b">Tél</td><td>${phone}</td></tr>` : ''}
          ${commune ? `<tr><td style="padding:6px 0;color:#64748b">Commune</td><td>${commune}</td></tr>` : ''}
          ${type_local ? `<tr><td style="padding:6px 0;color:#64748b">Bien</td><td>${type_local}${surface ? ` · ${surface} m²` : ''}</td></tr>` : ''}
          ${estimation_centrale ? `<tr><td style="padding:6px 0;color:#64748b">Estimation</td><td><strong style="color:#4f46e5">${fmt(estimation_centrale)}</strong></td></tr>` : ''}
        </table>
        <p style="margin-top:20px"><a href="https://empploy.odoo.com/odoo/crm" style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir dans Odoo CRM →</a></p>
      </div>`,
  });
}

// ─────────────────────────────────────────────────────────────
// 3. Alerte agence pro/premium — lead sur leur commune
// ─────────────────────────────────────────────────────────────
export async function emailProNewLead(params: {
  pro_email:  string;
  pro_name:   string;
  lead_name:  string;
  lead_phone?: string;
  commune?:   string;
  estimation_min?: number;
  estimation_max?: number;
  type_local?: string;
  surface?:   number;
  dashboard_token: string;
}) {
  const {
    pro_email, pro_name, lead_name, lead_phone,
    commune, estimation_min, estimation_max, type_local, surface, dashboard_token
  } = params;
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const dashUrl = `https://terrimo.homes/pro/dashboard/${dashboard_token}`;

  return sendEmail({
    to:      pro_email,
    subject: `🔔 Nouveau prospect à ${commune ?? 'contacter'} — Terrimo`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:#4f46e5;padding:20px 28px;border-radius:12px 12px 0 0">
          <h2 style="color:white;margin:0;font-size:18px">🔔 Nouveau prospect Terrimo</h2>
        </div>
        <div style="background:white;padding:24px 28px;border:1px solid #e2e8f0;border-top:none">
          <p>Bonjour <strong>${pro_name}</strong>,</p>
          <p>Un propriétaire cherche une agence sur <strong>${commune ?? 'le Bassin d\'Arcachon'}</strong> pour estimer et vendre son bien.</p>
          <div style="background:#fef9ff;border:1.5px solid #c7d2fe;border-radius:8px;padding:16px 20px;margin:16px 0">
            <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase">Contact prospect</p>
            <p style="margin:0;font-size:16px;font-weight:700">${lead_name}</p>
            ${lead_phone ? `<p style="margin:4px 0 0;font-size:14px;color:#4f46e5"><a href="tel:${lead_phone}" style="color:#4f46e5">${lead_phone}</a></p>` : '<p style="margin:4px 0 0;font-size:12px;color:#94a3b8">Téléphone non renseigné</p>'}
            ${type_local && surface ? `<p style="margin:8px 0 0;font-size:13px;color:#64748b">${type_local} · ${surface} m² · ${commune}</p>` : ''}
            ${estimation_min && estimation_max ? `<p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#059669">${fmt(estimation_min)} – ${fmt(estimation_max)}</p>` : ''}
          </div>
          <p style="font-size:13px;color:#64748b">Contactez ce prospect rapidement — les prospects Terrimo sont partagés avec plusieurs agences de votre commune.</p>
          <p><a href="${dashUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">Voir dans mon dashboard →</a></p>
        </div>
        <div style="padding:12px 28px;font-size:11px;color:#94a3b8;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          Vous recevez cet email car vous êtes abonné au plan <strong>Pro</strong> ou <strong>Premium</strong> Terrimo.
          <br><a href="${dashUrl}" style="color:#4f46e5">Gérer mes préférences</a>
        </div>
      </div>`,
  });
}

// ─────────────────────────────────────────────────────────────
// 4. Magic link dashboard — envoyé au pro à l'inscription
// ─────────────────────────────────────────────────────────────
export async function emailProMagicLink(params: {
  pro_email:  string;
  pro_name:   string;
  plan:       string;
  token:      string;
}) {
  const { pro_email, pro_name, plan, token } = params;
  const dashUrl = `https://terrimo.homes/pro/dashboard/${token}`;
  const planLabel = plan === 'premium' ? '💎 Premium' : plan === 'pro' ? '⭐ Pro' : '🆓 Free';

  return sendEmail({
    to:      pro_email,
    subject: `Bienvenue sur Terrimo — accès à votre espace pro`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Terrimo</h1>
          <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:13px">Votre espace professionnel</p>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #e2e8f0;border-top:none">
          <p>Bonjour <strong>${pro_name}</strong>,</p>
          <p>Votre inscription Terrimo a bien été reçue. Votre fiche est en cours de validation.</p>
          <div style="background:#f1f5f9;border-radius:8px;padding:14px 18px;margin:16px 0">
            <span style="font-size:13px;color:#64748b">Plan actuel : </span>
            <strong style="font-size:14px">${planLabel}</strong>
          </div>
          <p>Accédez à votre espace pro pour :</p>
          <ul style="font-size:14px;color:#475569;line-height:1.8;padding-left:20px">
            <li>Modifier vos coordonnées</li>
            <li>Voir les leads reçus (plan Pro/Premium)</li>
            <li>Ajouter votre portefeuille de biens (plan Pro/Premium)</li>
            <li>Upgrader votre plan</li>
          </ul>
          <div style="text-align:center;margin:24px 0">
            <a href="${dashUrl}" style="background:#4f46e5;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;display:inline-block">Accéder à mon espace pro →</a>
          </div>
          <p style="font-size:12px;color:#94a3b8">Ce lien est personnel et sécurisé. Conservez-le précieusement ou ajoutez-le en favori.</p>
        </div>
        <div style="padding:14px 32px;font-size:11px;color:#94a3b8;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          Terrimo · Bassin d'Arcachon · <a href="https://terrimo.homes" style="color:#4f46e5">terrimo.homes</a>
          · <a href="mailto:pro@terrimo.homes" style="color:#4f46e5">pro@terrimo.homes</a>
        </div>
      </div>`,
  });
}
