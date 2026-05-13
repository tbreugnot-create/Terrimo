/**
 * POST /api/auth/magic-link
 * Body: { email: string }
 * Crée ou retrouve un acteur particulier et envoie un lien d'accès.
 * Toujours répond 200 (ne révèle pas si le compte existe).
 */
import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateParticulier, sendParticulierMagicLink } from '@/lib/particulier';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string };

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    const acteur = await findOrCreateParticulier(email, name);

    // Fire & forget — on ne révèle pas si l'email existait déjà
    sendParticulierMagicLink(acteur.email, acteur.name, acteur.access_token).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/magic-link]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
