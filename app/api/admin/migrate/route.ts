/**
 * TERRIMO — POST /api/admin/migrate
 * Endpoint one-shot pour exécuter les migrations en production.
 * Protégé par ADMIN_SECRET.
 * Supprimer ou désactiver après usage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function checkSecret(secret: string | null): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || adminSecret === 'change_me') return false;
  return secret === adminSecret;
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { secret: string; migration: string };

  if (!checkSecret(body.secret)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    if (body.migration === 'stripe') {
      await sql`
        ALTER TABLE acteurs
          ADD COLUMN IF NOT EXISTS stripe_customer_id     VARCHAR(100),
          ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS acteurs_stripe_customer_idx
          ON acteurs (stripe_customer_id)
          WHERE stripe_customer_id IS NOT NULL
      `;
      return NextResponse.json({ ok: true, migration: 'stripe', message: 'Colonnes stripe ajoutées' });
    }

    if (body.migration === 'mandats') {
      await sql`
        CREATE TABLE IF NOT EXISTS mandats_recherche (
          id                  BIGSERIAL PRIMARY KEY,
          token               VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
          email               VARCHAR(255) NOT NULL,
          phone               VARCHAR(20),
          prenom              VARCHAR(100),
          type_acquisition    VARCHAR(30),
          horizon             VARCHAR(20),
          premiere_acquisition BOOLEAN DEFAULT false,
          communes            TEXT[]  NOT NULL DEFAULT '{}',
          proximites          TEXT[]  DEFAULT '{}',
          accepte_renovation  BOOLEAN DEFAULT true,
          types_bien          TEXT[]  DEFAULT '{}',
          surface_min         INTEGER,
          surface_max         INTEGER,
          chambres_min        SMALLINT,
          terrain_souhaite    BOOLEAN DEFAULT false,
          terrain_min         INTEGER,
          caracteristiques    TEXT[]  DEFAULT '{}',
          budget_max          INTEGER,
          budget_travaux      INTEGER,
          apport              INTEGER,
          mode_financement    VARCHAR(20),
          accord_bancaire     BOOLEAN DEFAULT false,
          sci                 BOOLEAN DEFAULT false,
          eligible_ptz        BOOLEAN DEFAULT false,
          vente_conditionnee  BOOLEAN DEFAULT false,
          accepte_copropriete BOOLEAN DEFAULT true,
          charges_max         INTEGER,
          dpe_acceptes        TEXT[]  DEFAULT '{}',
          description         TEXT,
          is_active           BOOLEAN DEFAULT true,
          expires_at          TIMESTAMP DEFAULT NOW() + INTERVAL '6 months',
          notified_at         TIMESTAMP,
          created_at          TIMESTAMP DEFAULT NOW(),
          updated_at          TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS mandats_communes_idx   ON mandats_recherche USING gin(communes)`;
      await sql`CREATE INDEX IF NOT EXISTS mandats_active_exp_idx ON mandats_recherche (is_active, expires_at)`;
      await sql`CREATE INDEX IF NOT EXISTS mandats_created_idx    ON mandats_recherche (created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS mandats_email_idx      ON mandats_recherche (email)`;
      await sql`CREATE INDEX IF NOT EXISTS mandats_token_idx      ON mandats_recherche (token)`;
      return NextResponse.json({ ok: true, migration: 'mandats', message: 'Table mandats_recherche créée' });
    }

    if (body.migration === 'bien_events') {
      await sql`
        CREATE TABLE IF NOT EXISTS bien_events (
          id         BIGSERIAL PRIMARY KEY,
          bien_id    BIGINT NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
          acteur_id  BIGINT,
          event_type VARCHAR(30) NOT NULL,
          ip         VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS bien_events_bien_idx    ON bien_events (bien_id, event_type)`;
      await sql`CREATE INDEX IF NOT EXISTS bien_events_created_idx ON bien_events (created_at DESC)`;
      return NextResponse.json({ ok: true, migration: 'bien_events', message: 'Table bien_events créée' });
    }

    if (body.migration === 'zone_alertes') {
      await sql`
        CREATE TABLE IF NOT EXISTS zone_alertes (
          id          BIGSERIAL PRIMARY KEY,
          email       VARCHAR(255) NOT NULL,
          polygon     JSONB NOT NULL,
          types_bien  TEXT[]  DEFAULT '{}',
          prix_max    INTEGER,
          surface_min INTEGER,
          pieces_min  SMALLINT,
          is_active   BOOLEAN DEFAULT true,
          notified_at TIMESTAMP,
          created_at  TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS zone_alertes_active_idx ON zone_alertes (is_active)`;
      return NextResponse.json({ ok: true, migration: 'zone_alertes', message: 'Table zone_alertes créée' });
    }

    if (body.migration === 'status') {
      // Vérifier l'état des tables
      const tables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      const cols = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'acteurs' AND column_name LIKE 'stripe%'
      `;
      return NextResponse.json({ ok: true, tables: tables.map(r => r.table_name), stripe_cols: cols.map(r => r.column_name) });
    }

    return NextResponse.json({ error: 'Migration inconnue. Options: stripe|mandats|bien_events|zone_alertes|status' }, { status: 400 });

  } catch (err) {
    console.error('[/api/admin/migrate]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
