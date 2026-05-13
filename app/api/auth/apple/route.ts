/**
 * GET /api/auth/apple
 * Redirige vers la page d'autorisation Apple Sign In.
 * Env requis :
 *   APPLE_CLIENT_ID   → Service ID (ex: com.terrimo.auth)
 *   APPLE_TEAM_ID     → Team ID Apple Developer
 *   APPLE_KEY_ID      → Key ID de la clé privée
 *   APPLE_PRIVATE_KEY → Contenu du fichier .p8 (avec \n réels ou \\n)
 *   NEXT_PUBLIC_SITE_URL
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Apple Sign In non configuré' }, { status: 503 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terrimo.homes';
  const redirectUri = `${base}/api/auth/apple/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope:         'name email',
  });

  return NextResponse.redirect(
    `https://appleid.apple.com/auth/authorize?${params.toString()}`
  );
}
