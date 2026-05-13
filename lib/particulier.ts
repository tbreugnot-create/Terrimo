/**
 * TERRIMO — Helper Particulier
 * Crée ou retrouve un acteur de type 'particulier' (plan free, is_active=true immédiatement).
 */
import { sql } from '@/lib/db';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface ParticulierRecord {
  id: number;
  name: string;
  email: string;
  access_token: string;
}

/**
 * Trouve ou crée un acteur particulier à partir de son email.
 * Si l'acteur existe déjà (quel que soit son type), on le retourne tel quel.
 * Sinon on crée un nouveau particulier free.
 */
export async function findOrCreateParticulier(
  email: string,
  name: string,
  avatarUrl?: string,
): Promise<ParticulierRecord> {
  const normalEmail = email.toLowerCase().trim();

  // 1. Chercher un acteur existant avec cet email
  const existing = await sql`
    SELECT id, name, email, access_token
    FROM acteurs
    WHERE email = ${normalEmail}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return existing[0] as ParticulierRecord;
  }

  // 2. Créer un nouvel acteur particulier
  const baseSlug = slugify(name || normalEmail.split('@')[0]);
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const conflict = await sql`SELECT id FROM acteurs WHERE slug = ${slug} LIMIT 1`;
    if (!conflict.length) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  const meta = {
    source: 'particulier',
    registered_at: new Date().toISOString(),
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const rows = await sql`
    INSERT INTO acteurs (type, name, slug, email, phone, website, address, commune, plan, meta, is_active)
    VALUES (
      'particulier',
      ${name || normalEmail.split('@')[0]},
      ${slug},
      ${normalEmail},
      '', '', '', '',
      'free',
      ${JSON.stringify(meta)}::jsonb,
      true
    )
    RETURNING id, name, email, access_token
  `;
  return rows[0] as ParticulierRecord;
}

/** Envoie un email magic-link au particulier */
export async function sendParticulierMagicLink(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes'}/proprietaire/mes-annonces/${token}`;

  const html = `
<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
  <div style="background:linear-gradient(135deg,#0a1626,#0c2240);padding:36px;">
    <div style="font-size:1.75rem;font-weight:900;color:white;letter-spacing:-.03em;">
      Terri<span style="color:#38bdf8">mo</span>
    </div>
    <div style="font-size:.75rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-top:4px;">Déposer une annonce</div>
  </div>
  <div style="padding:36px;">
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 12px;">Bonjour <strong>${name}</strong>,</p>
    <p style="color:#334155;font-size:1rem;line-height:1.7;margin:0 0 24px;">
      Voici votre lien d'accès à votre espace particulier Terrimo. Cliquez ci-dessous pour accéder à vos annonces.
    </p>
    <a href="${url}" style="display:block;text-align:center;background:#38bdf8;color:#0c1a2e;font-weight:800;font-size:1rem;padding:16px 28px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
      Accéder à mes annonces →
    </a>
    <p style="color:#94a3b8;font-size:.8125rem;line-height:1.6;margin:0;">
      Ce lien est personnel. Si vous n'avez pas demandé cet email, ignorez-le simplement.
    </p>
  </div>
  <div style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:.75rem;margin:0;">
      Terrimo · Bassin d'Arcachon · <a href="https://terrimo.homes" style="color:#6366f1;">terrimo.homes</a>
    </p>
  </div>
</div>
</body></html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Terrimo <contact@terrimo.homes>',
      to: email,
      subject: 'Votre lien pour déposer une annonce sur Terrimo',
      html,
    }),
  });
}
