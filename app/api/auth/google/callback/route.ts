/**
 * GET /api/auth/google/callback?code=xxx
 * Échange le code Google contre les infos utilisateur,
 * crée/retrouve l'acteur particulier, redirige vers son dashboard.
 * Env requis : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL
 */
import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateParticulier } from '@/lib/particulier';

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';
  const errorRedirect = `${base}/proprietaire/auth?error=google`;

  try {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.redirect(errorRedirect);

    const clientId     = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return NextResponse.redirect(errorRedirect);

    const redirectUri = `${base}/api/auth/google/callback`;

    // 1. Échanger le code contre un access_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }).toString(),
    });
    const tokenData = await tokenRes.json() as GoogleTokenResponse;
    if (!tokenData.access_token) return NextResponse.redirect(errorRedirect);

    // 2. Récupérer les infos utilisateur
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json() as GoogleUserInfo;
    if (!user.email) return NextResponse.redirect(errorRedirect);

    // 3. Créer ou retrouver l'acteur particulier
    const acteur = await findOrCreateParticulier(user.email, user.name ?? '', user.picture);

    // 4. Rediriger vers le dashboard particulier avec cookie de session
    const destination = `${base}/proprietaire/mes-annonces/${acteur.access_token}`;
    const response = NextResponse.redirect(destination);
    response.cookies.set('terrimo_token', acteur.access_token, {
      path:     '/',
      maxAge:   60 * 60 * 24 * 30, // 30 jours
      sameSite: 'lax',
      httpOnly: false, // lisible côté client pour la Nav
      secure:   process.env.NODE_ENV === 'production',
    });
    return response;
  } catch (err) {
    console.error('[auth/google/callback]', err);
    return NextResponse.redirect(errorRedirect);
  }
}
