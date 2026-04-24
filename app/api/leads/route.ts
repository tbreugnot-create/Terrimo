/**
 * TERRIMO — API Leads
 * POST /api/leads
 *
 * Enregistre un lead (contact depuis "Évaluer mon bien", carte, ou fiche quartier)
 * et notifie les agences premium du secteur.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface LeadRequest {
  name: string;
  email: string;
  phone?: string;
  commune?: string;
  source?: string;  // 'evaluer' | 'map' | 'quartier' | 'contact'
  message?: string;
  agency_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadRequest = await request.json();
    const { name, email, phone, commune, source = 'evaluer', message, agency_id } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }

    // Email basique validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Insérer le lead
    const result = await sql`
      INSERT INTO leads (name, email, phone, commune, source, message, agency_id)
      VALUES (
        ${name},
        ${email},
        ${phone || null},
        ${commune || null},
        ${source},
        ${message || null},
        ${agency_id || null}
      )
      RETURNING id, created_at
    `;

    const lead = result[0];

    // TODO Phase 2: Notifier les agences premium du secteur par email/push
    // await notifyPremiumAgencies({ commune, lead_id: lead.id, name, commune, source });

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      message: 'Lead enregistré. Une agence vous contactera sous 24h.',
    });

  } catch (error) {
    console.error('Erreur /api/leads:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
