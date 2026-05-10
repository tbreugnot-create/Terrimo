/**
 * TERRIMO — GET /api/alertes/unsubscribe?id=<uuid>
 * Désactive une alerte zone (lien dans les emails).
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return new NextResponse('Lien invalide.', { status: 400, headers: { 'Content-Type': 'text/html' } });
  }

  try {
    await sql`UPDATE zone_alertes SET is_active = false WHERE id = ${id}`;

    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Alerte désactivée — Terrimo</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center;
                 min-height: 100vh; margin: 0; background: #0f172a; color: white; }
          .card { text-align: center; max-width: 400px; padding: 40px 32px; }
          h1 { font-size: 1.5rem; margin: 0 0 12px; }
          p { color: rgba(255,255,255,.6); line-height: 1.6; }
          a { color: #818cf8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size:3rem;margin-bottom:16px">✅</div>
          <h1>Alerte désactivée</h1>
          <p>Vous ne recevrez plus de notifications pour cette zone.</p>
          <p style="margin-top:24px">
            <a href="https://terrimo.homes">Retour à Terrimo →</a>
          </p>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('[unsubscribe]', err);
    return new NextResponse('Erreur serveur.', { status: 500 });
  }
}
