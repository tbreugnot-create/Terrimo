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

// ─────────────────────────────────────────────────────────────
// 4. Confirmation d'inscription à une alerte zone
// ─────────────────────────────────────────────────────────────
export async function emailAlerteConfirmation(params: {
  email: string;
  type_annonce?: string;
  prix_max?: number;
  surface_min?: number;
  alerteId: string;
}) {
  const { email, type_annonce, prix_max, surface_min, alerteId } = params;
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const filtres = [
    type_annonce ? `Type : <strong>${type_annonce === 'vente' ? 'Vente' : type_annonce === 'location' ? 'Location' : 'Location saisonnière'}</strong>` : null,
    prix_max     ? `Budget max : <strong>${fmt(prix_max)}</strong>` : null,
    surface_min  ? `Surface min : <strong>${surface_min} m²</strong>` : null,
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  const unsubUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes'}/api/alertes/unsubscribe?id=${alerteId}`;

  return sendEmail({
    to: email,
    subject: '🔔 Votre alerte zone Terrimo est active',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Terrimo</h1>
          <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px">Bassin d'Arcachon · Alertes zone</p>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #e2e8f0;border-top:none">
          <p style="font-size:15px;margin:0 0 16px">Votre alerte est bien activée ✅</p>
          <p style="color:#475569;font-size:14px;margin:0 0 20px">
            Vous recevrez un email dès qu'un bien correspondant à votre zone dessinée sera publié sur Terrimo.
          </p>

          ${filtres ? `
          <div style="background:#f1f5f9;border-radius:8px;padding:14px 18px;margin:0 0 20px;font-size:13px;color:#475569">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Filtres actifs</p>
            <p style="margin:0">${filtres}</p>
          </div>` : `
          <div style="background:#f1f5f9;border-radius:8px;padding:14px 18px;margin:0 0 20px;font-size:13px;color:#475569">
            Tous types de biens · Tous budgets
          </div>`}

          <p style="font-size:13px;color:#94a3b8;margin:0">
            Pour désactiver cette alerte : <a href="${unsubUrl}" style="color:#6366f1">se désabonner</a>
          </p>
        </div>
        <div style="padding:14px 32px;font-size:11px;color:#94a3b8;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          Terrimo · Bassin d'Arcachon · <a href="https://terrimo.homes" style="color:#4f46e5">terrimo.homes</a>
        </div>
      </div>`,
  });
}

// ─────────────────────────────────────────────────────────────
// 5. Notification "Nouveau bien dans votre zone"
// ─────────────────────────────────────────────────────────────
interface BienMatch {
  id: string;
  titre?: string;
  type_bien: string;
  type_annonce: string;
  prix?: number;
  surface?: number;
  pieces?: number;
  commune: string;
  acteur_name?: string;
}

export async function emailNouveauBienZone(params: {
  email: string;
  alerteId: string;
  biens: BienMatch[];
}) {
  const { email, alerteId, biens } = params;
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const unsubUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes'}/api/alertes/unsubscribe?id=${alerteId}`;
  const carteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes'}/?ouvre-carte=1`;

  const nb = biens.length;
  const biensHtml = biens.slice(0, 5).map(b => `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a">
            ${b.titre ?? `${b.type_bien} · ${b.commune}`}
          </p>
          <p style="margin:0;font-size:12px;color:#64748b">
            ${b.commune}${b.surface ? ` · ${b.surface} m²` : ''}${b.pieces ? ` · ${b.pieces} p.` : ''}
          </p>
        </div>
        ${b.prix ? `<p style="margin:0;font-size:15px;font-weight:700;color:#4f46e5;white-space:nowrap">${fmt(b.prix)}</p>` : ''}
      </div>
      ${b.acteur_name ? `<p style="margin:6px 0 0;font-size:11px;color:#94a3b8">Via ${b.acteur_name}</p>` : ''}
    </div>
  `).join('');

  return sendEmail({
    to: email,
    subject: `🏡 ${nb} nouveau${nb > 1 ? 'x biens' : ' bien'} dans votre zone Terrimo`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Terrimo</h1>
          <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px">Bassin d'Arcachon · Alerte zone</p>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #e2e8f0;border-top:none">
          <p style="font-size:16px;font-weight:700;margin:0 0 6px">
            🔔 ${nb} nouveau${nb > 1 ? 'x biens correspondent' : ' bien correspond'} à votre zone
          </p>
          <p style="font-size:14px;color:#475569;margin:0 0 20px">
            ${nb > 1 ? 'Ces biens viennent' : 'Ce bien vient'} d'être publié${nb > 1 ? 's' : ''} dans la zone que vous avez dessinée.
          </p>

          ${biensHtml}

          <div style="text-align:center;margin:24px 0 0">
            <a href="${carteUrl}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px">
              Voir sur la carte →
            </a>
          </div>
        </div>
        <div style="padding:14px 32px;font-size:11px;color:#94a3b8;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          Terrimo · <a href="${unsubUrl}" style="color:#94a3b8">Se désabonner</a>
        </div>
      </div>`,
  });
}

// ── Email : confirmation création bien pro ──────────────────────
export async function emailBienPubilé(data: {
  email: string;
  acteurName: string;
  bienId: number;
  titre: string;
  commune: string;
  typeAnnonce: string;
  prix?: number;
  dashboardToken: string;
}): Promise<void> {
  const { email, acteurName, bienId, titre, commune, typeAnnonce, prix, dashboardToken } = data;
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';
  const bienUrl = `${SITE}/bien/${bienId}`;
  const dashboardUrl = `${SITE}/pro/dashboard/${dashboardToken}`;
  const typeLabel = typeAnnonce === 'vente' ? '💰 Vente' : typeAnnonce === 'location' ? '🔑 Location' : typeAnnonce;
  const prixStr = prix ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prix) : '';

  await sendEmail({
    to: email,
    subject: `✅ Votre bien est publié sur Terrimo — ${titre}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Terrimo</h1>
          <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px">Bassin d'Arcachon · Espace Pro</p>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #e2e8f0;border-top:none">
          <p style="font-size:16px;font-weight:700;margin:0 0 6px">Bonjour ${acteurName},</p>
          <p style="font-size:14px;color:#475569;margin:0 0 20px">
            Votre bien est maintenant visible sur la carte Terrimo et indexé par les moteurs de recherche.
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin:0 0 20px">
            <div style="font-weight:700;font-size:15px;margin:0 0 6px">${titre}</div>
            <div style="font-size:13px;color:#64748b">${typeLabel}${prixStr ? ` · ${prixStr}` : ''} · ${commune}</div>
          </div>
          <div style="display:flex;gap:12px;margin:20px 0 0">
            <a href="${bienUrl}" style="flex:1;text-align:center;display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:700;font-size:13px">
              Voir la fiche →
            </a>
            <a href="${dashboardUrl}" style="flex:1;text-align:center;display:inline-block;background:#f1f5f9;color:#475569;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:13px;border:1px solid #e2e8f0">
              Mon dashboard
            </a>
          </div>
        </div>
        <div style="padding:14px 32px;font-size:11px;color:#94a3b8;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          Terrimo · Bassin d'Arcachon · <a href="${dashboardUrl}" style="color:#94a3b8">Gérer mes biens</a>
        </div>
      </div>`,
  });
}

// ── Email : onboarding pro J0 (bienvenue) ──────────────────────
export async function emailOnboardingPro(data: {
  email: string;
  name: string;
  plan: string;
  dashboardToken: string;
}): Promise<void> {
  const { email, name, plan, dashboardToken } = data;
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';
  const dashboardUrl = `${SITE}/pro/dashboard/${dashboardToken}`;
  const planLabel = plan === 'premium' ? 'Premium 💎' : plan === 'pro' ? 'Pro ⭐' : 'Vitrine 🆓';
  const isPaid = plan !== 'free';

  await sendEmail({
    to: email,
    subject: `🎉 Bienvenue sur Terrimo, ${name} !`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:32px 32px 28px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">Bienvenue sur Terrimo 🏡</h1>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px">La carte immobilière du Bassin d'Arcachon</p>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #e2e8f0;border-top:none">
          <p style="font-size:15px;margin:0 0 8px">Bonjour <strong>${name}</strong>,</p>
          <p style="font-size:14px;color:#475569;margin:0 0 20px">
            Votre fiche professionnelle <strong>${planLabel}</strong> est créée. Voici vos prochaines étapes pour maximiser votre visibilité sur le Bassin.
          </p>

          <div style="border-left:3px solid #6366f1;padding:8px 0 8px 16px;margin:0 0 12px">
            <div style="font-weight:700;font-size:13px">① Compléter votre profil</div>
            <div style="font-size:13px;color:#64748b;margin:3px 0 0">Photo, description, spécialités, zones d'intervention.</div>
          </div>
          ${isPaid ? `
          <div style="border-left:3px solid #10b981;padding:8px 0 8px 16px;margin:0 0 12px">
            <div style="font-weight:700;font-size:13px">② Ajouter vos biens</div>
            <div style="font-size:13px;color:#64748b;margin:3px 0 0">Ils apparaissent comme pins orange sur la carte.</div>
          </div>
          <div style="border-left:3px solid #f59e0b;padding:8px 0 8px 16px;margin:0 0 20px">
            <div style="font-weight:700;font-size:13px">③ Consulter les acquéreurs</div>
            <div style="font-size:13px;color:#64748b;margin:3px 0 0">Profils et mandats de recherche de votre commune.</div>
          </div>
          ` : `
          <div style="border-left:3px solid #10b981;padding:8px 0 8px 16px;margin:0 0 20px">
            <div style="font-weight:700;font-size:13px">② Passer en Pro pour débloquer les leads</div>
            <div style="font-size:13px;color:#64748b;margin:3px 0 0">49€/mois — biens illimités, profils acquéreurs, analytics.</div>
          </div>
          `}

          <div style="text-align:center;margin:8px 0 0">
            <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:white;text-decoration:none;padding:13px 32px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(99,102,241,.35)">
              Accéder à mon espace Pro →
            </a>
          </div>
        </div>
        <div style="padding:14px 32px;font-size:11px;color:#94a3b8;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          Terrimo · Bassin d'Arcachon · <a href="mailto:contact@terrimo.homes" style="color:#94a3b8">Nous contacter</a>
        </div>
      </div>`,
  });
}
