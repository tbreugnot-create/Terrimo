/**
 * GET /api/auth/google
 * Redirige vers la page d'autorisation Google OAuth 2.0.
 * Env requis : GOOGLE_CLIENT_ID, NEXT_PUBLIC_SITE_URL
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth non configuré' }, { status: 503 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';
  const redirectUri = `${base}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
