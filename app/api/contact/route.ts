/**
 * TERRIMO — POST /api/contact
 * Formulaire de contact : notif admin + accusé réception
 */
import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      nom?: string;
      email?: string;
      sujet?: string;
      message?: string;
    };

    const { nom, email, sujet, message } = body;

    if (!nom || !email || !message) {
      return NextResponse.json({ error: 'Nom, email et message sont requis' }, { status: 400 });
    }

    // Validation email basique
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    await sendContactEmail({ nom, email, sujet: sujet ?? 'Contact Terrimo', message });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/contact]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
