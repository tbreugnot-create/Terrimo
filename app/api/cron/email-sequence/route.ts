/**
 * TERRIMO — GET /api/cron/email-sequence?secret=CRON_SECRET
 *
 * Séquence d'activation pro :
 *   J+1 : Email "Bienvenue — complétez votre profil"
 *   J+3 : Email "Importez vos premiers biens"
 *   J+7 : Email "Passez Pro — boostez votre visibilité"
 *
 * Cron Vercel recommandé : 0 8 * * * (chaque matin à 8h)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const CRON_SECRET = process.env.CRON_SECRET ?? 'TERRIMO_CRON_2026';
const FROM_EMAIL  = process.env.EMAIL_FROM ?? 'contact@terrimo.homes';
const BASE_URL    = 'https://terrimo.homes';

/* ─── Templates email ─────────────────────────────────────── */

function emailJ1(acteur: { name: string; access_token: string }) {
  const dashUrl = `${BASE_URL}/pro/dashboard/${acteur.access_token}`;
  return {
    subject: `Bienvenue sur Terrimo, ${acteur.name} 🏠`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
  <div style="background:linear-gradient(135deg,#0a1626,#0c2240);padding:40px 36px;">
    <img src="${BASE_URL}/logo-light.svg" alt="Terrimo" height="28" style="margin-bottom:20px;display:block;">
    <h1 style="color:white;font-size:1.5rem;font-weight:900;margin:0 0 8px;">Bienvenue sur Terrimo !</h1>
    <p style="color:rgba(255,255,255,.65);font-size:.9375rem;margin:0;line-height:1.6;">Votre espace professionnel est prêt. Voici comment en tirer le meilleur parti.</p>
  </div>
  <div style="padding:36px;">
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 20px;">Bonjour <strong>${acteur.name}</strong>,</p>
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">Votre compte Terrimo est activé. Pour démarrer, voici les 3 premières actions à faire :</p>

    <div style="background:#f0f9ff;border-left:4px solid #38bdf8;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:16px;">
      <div style="font-weight:700;color:#0c4a6e;margin-bottom:4px;">① Complétez votre profil agence</div>
      <div style="color:#0369a1;font-size:.9rem;">Ajoutez votre logo, description et numéro de téléphone pour rassurer les acheteurs.</div>
    </div>

    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:16px;">
      <div style="font-weight:700;color:#14532d;margin-bottom:4px;">② Publiez votre premier bien</div>
      <div style="color:#15803d;font-size:.9rem;">Chaque bien publié est géolocalisé sur la carte et indexé sur Google en moins de 24h.</div>
    </div>

    <div style="background:#faf5ff;border-left:4px solid #a855f7;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
      <div style="font-weight:700;color:#581c87;margin-bottom:4px;">③ Partagez votre lien agence</div>
      <div style="color:#7c3aed;font-size:.9rem;">Votre page agence publique est déjà en ligne — partagez-la à vos clients.</div>
    </div>

    <a href="${dashUrl}" style="display:block;text-align:center;background:#0c2240;color:white;font-weight:800;font-size:1rem;padding:16px 28px;border-radius:10px;text-decoration:none;margin-bottom:28px;">
      Accéder à mon espace →
    </a>

    <p style="color:#64748b;font-size:.875rem;line-height:1.6;margin:0;">
      Une question ? Répondez directement à cet email — nous répondons sous 24h.<br>
      <strong>L'équipe Terrimo</strong>
    </p>
  </div>
  <div style="background:#f8fafc;padding:20px 36px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:.8rem;margin:0;">
      Terrimo · Bassin d'Arcachon · <a href="${BASE_URL}" style="color:#6366f1;">terrimo.homes</a><br>
      <a href="${dashUrl}" style="color:#94a3b8;">Gérer mes préférences</a>
    </p>
  </div>
</div>
</body>
</html>`,
  };
}

function emailJ3(acteur: { name: string; access_token: string; plan: string }) {
  const dashUrl  = `${BASE_URL}/pro/dashboard/${acteur.access_token}`;
  const csvLimit = acteur.plan === 'premium' ? 'illimité' : acteur.plan === 'pro' ? '50/mois' : '0 (plan Pro requis)';
  return {
    subject: `📦 Importez vos biens en masse sur Terrimo`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
  <div style="background:linear-gradient(135deg,#0a1626,#0c2240);padding:40px 36px;">
    <img src="${BASE_URL}/logo-light.svg" alt="Terrimo" height="28" style="margin-bottom:20px;display:block;">
    <h1 style="color:white;font-size:1.5rem;font-weight:900;margin:0 0 8px;">Importez tous vos biens en 2 minutes</h1>
    <p style="color:rgba(255,255,255,.65);font-size:.9375rem;margin:0;line-height:1.6;">Notre import CSV vous évite de saisir chaque bien à la main.</p>
  </div>
  <div style="padding:36px;">
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 20px;">Bonjour <strong>${acteur.name}</strong>,</p>
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">Si vous avez un logiciel de transaction (Apimo, Hektor, Immofacile…), exportez simplement votre portefeuille en CSV et importez-le en 1 clic dans Terrimo.</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:10px 14px;background:#0c2240;color:white;font-weight:700;border-radius:8px 0 0 0;font-size:.875rem;">Plan</td>
        <td style="padding:10px 14px;background:#0c2240;color:white;font-weight:700;border-radius:0 8px 0 0;font-size:.875rem;">Import CSV</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">Free</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#ef4444;">✗ Désactivé</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;background:#f8fafc;color:#334155;">Pro</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;background:#f8fafc;color:#0369a1;">✓ 50 biens/mois</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#334155;">Premium</td>
        <td style="padding:10px 14px;color:#059669;">✓ Illimité</td>
      </tr>
    </table>

    <p style="color:#64748b;font-size:.9rem;margin:0 0 24px;">Votre plan actuel (<strong>${acteur.plan}</strong>) vous donne accès à : <strong>${csvLimit}</strong>.</p>

    <a href="${dashUrl}" style="display:block;text-align:center;background:#0c2240;color:white;font-weight:800;font-size:1rem;padding:16px 28px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
      Importer mes biens →
    </a>
    ${acteur.plan === 'free' ? `<a href="${BASE_URL}/tarifs" style="display:block;text-align:center;background:#f0f9ff;color:#0369a1;font-weight:700;font-size:.9375rem;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:28px;">
      Passer Pro — 79 €/mois →
    </a>` : '<div style="margin-bottom:28px;"></div>'}

    <p style="color:#64748b;font-size:.875rem;line-height:1.6;margin:0;">
      Besoin d'aide pour l'export depuis votre logiciel ? Répondez à cet email.<br>
      <strong>L'équipe Terrimo</strong>
    </p>
  </div>
  <div style="background:#f8fafc;padding:20px 36px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:.8rem;margin:0;">Terrimo · <a href="${BASE_URL}" style="color:#6366f1;">terrimo.homes</a></p>
  </div>
</div>
</body>
</html>`,
  };
}

function emailJ7(acteur: { name: string; access_token: string; plan: string }) {
  const dashUrl   = `${BASE_URL}/pro/dashboard/${acteur.access_token}`;
  const tarifsUrl = `${BASE_URL}/tarifs`;
  const isPaid    = acteur.plan !== 'free';
  return {
    subject: isPaid
      ? `📈 Vos performances Terrimo cette semaine`
      : `🚀 Boostez votre visibilité — offre spéciale agences`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
  <div style="background:linear-gradient(135deg,#0a1626,#0c2240);padding:40px 36px;">
    <img src="${BASE_URL}/logo-light.svg" alt="Terrimo" height="28" style="margin-bottom:20px;display:block;">
    <h1 style="color:white;font-size:1.5rem;font-weight:900;margin:0 0 8px;">
      ${isPaid ? 'Vos stats de la semaine' : 'Passez Pro — visibilité maximale'}
    </h1>
    <p style="color:rgba(255,255,255,.65);font-size:.9375rem;margin:0;line-height:1.6;">
      ${isPaid
        ? 'Votre activité sur Terrimo cette semaine.'
        : 'Les agences Pro génèrent 4× plus de contacts que les agences Free.'}
    </p>
  </div>
  <div style="padding:36px;">
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">Bonjour <strong>${acteur.name}</strong>,</p>

    ${isPaid ? `
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">
      Merci de faire confiance à Terrimo pour votre visibilité sur le Bassin d'Arcachon. Voici ce que vous pouvez faire pour amplifier vos résultats :
    </p>

    <div style="background:#f0f9ff;border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="font-weight:700;color:#0c4a6e;margin-bottom:8px;">💡 Astuce de la semaine</div>
      <p style="color:#0369a1;font-size:.9375rem;margin:0;line-height:1.6;">
        Ajoutez 3 photos minimum par bien — les annonces avec photos génèrent 3× plus de clics sur la carte.
      </p>
    </div>

    <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-weight:700;color:#14532d;margin-bottom:8px;">🎯 Mandats acquéreurs disponibles</div>
      <p style="color:#15803d;font-size:.9375rem;margin:0;line-height:1.6;">
        Des acheteurs cherchent activement sur votre secteur. Consultez les mandats compatibles avec vos biens dans votre dashboard.
      </p>
    </div>
    ` : `
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">
      Vous utilisez Terrimo en plan Free depuis une semaine. Voici ce que vous ratez :
    </p>

    <div style="margin-bottom:24px;">
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;padding:4px 8px;border-radius:6px;font-size:.875rem;white-space:nowrap;">Pro</span>
        <div style="color:#334155;font-size:.9375rem;">Biens illimités · Import CSV · Leads avec contacts directs</div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
        <span style="background:#faf5ff;color:#7c3aed;font-weight:700;padding:4px 8px;border-radius:6px;font-size:.875rem;white-space:nowrap;">Premium</span>
        <div style="color:#334155;font-size:.9375rem;">Tout Pro + Alertes acquéreurs en temps réel + import illimité</div>
      </div>
    </div>

    <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <div style="font-weight:800;color:#9a3412;font-size:1.125rem;margin-bottom:4px;">Offre lancement agences pilotes</div>
      <div style="color:#c2410c;font-size:.9375rem;line-height:1.6;">Premier mois offert sur le plan Pro ou Premium pour les 5 premières agences partenaires du Bassin.</div>
    </div>

    <a href="${tarifsUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-weight:800;font-size:1rem;padding:16px 28px;border-radius:10px;text-decoration:none;margin-bottom:12px;">
      Voir les offres →
    </a>
    `}

    <a href="${dashUrl}" style="display:block;text-align:center;background:#0c2240;color:white;font-weight:700;font-size:.9375rem;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:28px;">
      Accéder à mon dashboard →
    </a>

    <p style="color:#64748b;font-size:.875rem;line-height:1.6;margin:0;">
      Des questions sur votre compte ? Répondez à cet email.<br>
      <strong>L'équipe Terrimo</strong>
    </p>
  </div>
  <div style="background:#f8fafc;padding:20px 36px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:.8rem;margin:0;">Terrimo · <a href="${BASE_URL}" style="color:#6366f1;">terrimo.homes</a></p>
  </div>
</div>
</body>
</html>`,
  };
}

/* ─── Envoi email via Resend ──────────────────────────────── */

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('[email-sequence] RESEND_API_KEY manquante'); return false; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[email-sequence] Resend error', res.status, err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[email-sequence] fetch error', e);
    return false;
  }
}

/* ─── Table email_sequence_log ────────────────────────────── */

async function ensureLogTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS email_sequence_log (
      id          SERIAL PRIMARY KEY,
      acteur_id   INTEGER NOT NULL,
      day         INTEGER NOT NULL,  -- 1, 3, 7
      sent_at     TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(acteur_id, day)
    )
  `;
}

async function alreadySent(acteurId: number, day: number): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM email_sequence_log WHERE acteur_id = ${acteurId} AND day = ${day} LIMIT 1
  `;
  return rows.length > 0;
}

async function markSent(acteurId: number, day: number) {
  await sql`
    INSERT INTO email_sequence_log (acteur_id, day)
    VALUES (${acteurId}, ${day})
    ON CONFLICT DO NOTHING
  `;
}

/* ─── Handler principal ───────────────────────────────────── */

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureLogTable();

  // Récupérer les acteurs éligibles à la séquence :
  // créés il y a 1-7 jours, is_active = true, email non nul
  const acteurs = await sql`
    SELECT id, name, email, plan, access_token,
           EXTRACT(DAY FROM NOW() - created_at)::int AS days_since_signup
    FROM acteurs
    WHERE is_active = true
      AND email IS NOT NULL
      AND email != ''
      AND created_at >= NOW() - INTERVAL '14 days'
    ORDER BY created_at ASC
  `;

  const results: Array<{
    acteur: string; email: string; day: number; sent: boolean; skipped?: boolean
  }> = [];

  for (const a of acteurs) {
    const days = a.days_since_signup as number;
    const acteur = {
      name: a.name as string,
      email: a.email as string,
      plan: a.plan as string,
      access_token: a.access_token as string,
    };

    // J+1 : entre 1 et 2 jours depuis inscription
    if (days >= 1 && days < 3) {
      if (await alreadySent(a.id as number, 1)) {
        results.push({ acteur: acteur.name, email: acteur.email, day: 1, sent: false, skipped: true });
      } else {
        const { subject, html } = emailJ1(acteur);
        const ok = await sendEmail(acteur.email, subject, html);
        if (ok) await markSent(a.id as number, 1);
        results.push({ acteur: acteur.name, email: acteur.email, day: 1, sent: ok });
      }
    }

    // J+3 : entre 3 et 4 jours
    if (days >= 3 && days < 5) {
      if (await alreadySent(a.id as number, 3)) {
        results.push({ acteur: acteur.name, email: acteur.email, day: 3, sent: false, skipped: true });
      } else {
        const { subject, html } = emailJ3(acteur);
        const ok = await sendEmail(acteur.email, subject, html);
        if (ok) await markSent(a.id as number, 3);
        results.push({ acteur: acteur.name, email: acteur.email, day: 3, sent: ok });
      }
    }

    // J+7 : entre 7 et 8 jours
    if (days >= 7 && days < 9) {
      if (await alreadySent(a.id as number, 7)) {
        results.push({ acteur: acteur.name, email: acteur.email, day: 7, sent: false, skipped: true });
      } else {
        const { subject, html } = emailJ7(acteur);
        const ok = await sendEmail(acteur.email, subject, html);
        if (ok) await markSent(a.id as number, 7);
        results.push({ acteur: acteur.name, email: acteur.email, day: 7, sent: ok });
      }
    }
  }

  const sent    = results.filter(r => r.sent).length;
  const skipped = results.filter(r => r.skipped).length;

  console.log(`[email-sequence] ${sent} envoyés, ${skipped} ignorés (déjà envoyés)`);

  return NextResponse.json({
    ok: true,
    processed: acteurs.length,
    sent,
    skipped,
    results,
  });
}
