/**
 * POST /api/pro/magic-link
 * Body: { email: string }
 *
 * Si l'email existe dans acteurs, envoie un lien vers le dashboard.
 * Toujours répond 200 (pas de fuite d'info sur l'existence du compte).
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const FROM_EMAIL = process.env.EMAIL_FROM ?? 'contact@terrimo.homes';
const BASE_URL   = 'https://terrimo.homes';

async function sendMagicLink(email: string, name: string, token: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[magic-link] RESEND_API_KEY manquante');
    return;
  }
  const dashUrl = `${BASE_URL}/pro/dashboard/${token}`;
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
  <div style="background:linear-gradient(135deg,#0a1626,#0c2240);padding:36px;">
    <div style="font-size:1.75rem;font-weight:900;color:white;letter-spacing:-.03em;margin-bottom:4px;">
      Terri<span style="color:#38bdf8">mo</span>
    </div>
    <div style="font-size:.75rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;">Espace professionnel</div>
  </div>
  <div style="padding:36px;">
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 12px;">Bonjour <strong>${name}</strong>,</p>
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">
      Voici votre lien de connexion à votre espace Terrimo. Cliquez sur le bouton ci-dessous pour accéder à votre tableau de bord.
    </p>
    <a href="${dashUrl}" style="display:block;text-align:center;background:#0c2240;color:white;font-weight:800;font-size:1rem;padding:16px 28px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
      Accéder à mon espace →
    </a>
    <p style="color:#94a3b8;font-size:.8125rem;line-height:1.6;margin:0;">
      Ce lien est personnel et ne doit pas être partagé. Il donne accès à votre tableau de bord Terrimo.<br><br>
      Si vous n'avez pas demandé ce lien, ignorez simplement cet email.
    </p>
  </div>
  <div style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:.75rem;margin:0;">
      Terrimo · Bassin d'Arcachon · <a href="${BASE_URL}" style="color:#6366f1;">terrimo.homes</a>
    </p>
  </div>
</div>
</body>
</html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: 'Votre lien de connexion Terrimo',
      html,
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string };
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Chercher l'acteur (sans révéler si le compte existe)
    const rows = await sql`
      SELECT name, access_token
      FROM acteurs
      WHERE email = ${email.toLowerCase().trim()}
        AND is_active = true
      LIMIT 1
    `;

    if (rows.length > 0) {
      const acteur = rows[0];
      await sendMagicLink(email, acteur.name as string, acteur.access_token as string);
    }
    // Toujours 200 pour ne pas révéler si l'email existe
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[magic-link]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
