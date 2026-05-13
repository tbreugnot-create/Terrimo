/**
 * POST /api/auth/apple/callback
 * Apple envoie le résultat en POST (form_post) avec :
 *  - code        : authorization code
 *  - id_token    : JWT signé par Apple (contient email + sub)
 *  - user        : JSON stringifié (uniquement au 1er login) { name: { firstName, lastName }, email }
 *
 * On decode le id_token (sans vérifier la signature — Apple public keys changent,
 * la vérification complète peut être ajoutée via /auth/keys endpoint Apple).
 */
import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateParticulier } from '@/lib/particulier';

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const [, payload] = token.split('.');
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';
  const errorRedirect = `${base}/proprietaire/auth?error=apple`;

  try {
    const formData = await request.formData();
    const idToken  = formData.get('id_token') as string | null;
    const userJson = formData.get('user')     as string | null;

    if (!idToken) return NextResponse.redirect(errorRedirect);

    // Decoder le payload du JWT (pas de vérification de signature côté edge)
    const claims = decodeJwtPayload(idToken);
    const email  = claims.email as string | undefined;
    if (!email)  return NextResponse.redirect(errorRedirect);

    // Apple envoie le nom seulement au 1er login
    let name = '';
    if (userJson) {
      try {
        const u = JSON.parse(userJson) as { name?: { firstName?: string; lastName?: string } };
        name = [u.name?.firstName, u.name?.lastName].filter(Boolean).join(' ');
      } catch { /* ignore */ }
    }

    const acteur = await findOrCreateParticulier(email, name || email.split('@')[0]);
    return NextResponse.redirect(`${base}/proprietaire/mes-annonces/${acteur.access_token}`);
  } catch (err) {
    console.error('[auth/apple/callback]', err);
    return NextResponse.redirect(errorRedirect);
  }
}
