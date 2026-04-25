/**
 * TERRIMO — API Biens
 * GET  /api/biens              → liste publique (carte)
 * POST /api/biens              → créer un bien (token acteur requis)
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 60; // 1 min cache

// ─────────────────────────────────────────────────────────────
// GET — Liste des biens actifs (avec info agence)
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const commune      = searchParams.get('commune');
  const type_annonce = searchParams.get('type_annonce');
  const acteur_id    = searchParams.get('acteur_id');

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[];

    if (commune && type_annonce) {
      rows = await sql`
        SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
               b.pieces, b.chambres, b.dpe, b.commune, b.adresse,
               b.lat, b.lng, b.photos, b.has_piscine, b.has_garage, b.has_terrasse,
               b.is_featured, b.created_at,
               a.id as acteur_id, a.name as acteur_name, a.type as acteur_type,
               a.slug as acteur_slug, a.phone as acteur_phone, a.email as acteur_email
        FROM biens b
        JOIN acteurs a ON a.id = b.acteur_id
        WHERE b.is_active = true
          AND b.lat IS NOT NULL
          AND b.commune = ${commune}
          AND b.type_annonce = ${type_annonce}
        ORDER BY b.is_featured DESC, b.created_at DESC
      `;
    } else if (commune) {
      rows = await sql`
        SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
               b.pieces, b.chambres, b.dpe, b.commune, b.adresse,
               b.lat, b.lng, b.photos, b.has_piscine, b.has_garage, b.has_terrasse,
               b.is_featured, b.created_at,
               a.id as acteur_id, a.name as acteur_name, a.type as acteur_type,
               a.slug as acteur_slug, a.phone as acteur_phone, a.email as acteur_email
        FROM biens b
        JOIN acteurs a ON a.id = b.acteur_id
        WHERE b.is_active = true
          AND b.lat IS NOT NULL
          AND b.commune = ${commune}
        ORDER BY b.is_featured DESC, b.created_at DESC
      `;
    } else if (type_annonce) {
      rows = await sql`
        SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
               b.pieces, b.chambres, b.dpe, b.commune, b.adresse,
               b.lat, b.lng, b.photos, b.has_piscine, b.has_garage, b.has_terrasse,
               b.is_featured, b.created_at,
               a.id as acteur_id, a.name as acteur_name, a.type as acteur_type,
               a.slug as acteur_slug, a.phone as acteur_phone, a.email as acteur_email
        FROM biens b
        JOIN acteurs a ON a.id = b.acteur_id
        WHERE b.is_active = true
          AND b.lat IS NOT NULL
          AND b.type_annonce = ${type_annonce}
        ORDER BY b.is_featured DESC, b.created_at DESC
      `;
    } else if (acteur_id) {
      rows = await sql`
        SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
               b.pieces, b.chambres, b.dpe, b.commune, b.adresse,
               b.lat, b.lng, b.photos, b.has_piscine, b.has_garage, b.has_terrasse,
               b.is_featured, b.is_active, b.created_at,
               a.id as acteur_id, a.name as acteur_name, a.type as acteur_type,
               a.slug as acteur_slug, a.phone as acteur_phone, a.email as acteur_email
        FROM biens b
        JOIN acteurs a ON a.id = b.acteur_id
        WHERE b.acteur_id = ${acteur_id}
        ORDER BY b.is_featured DESC, b.created_at DESC
      `;
    } else {
      // Tous les biens actifs géolocalisés
      rows = await sql`
        SELECT b.id, b.type_annonce, b.type_bien, b.titre, b.prix, b.surface,
               b.pieces, b.chambres, b.dpe, b.commune, b.adresse,
               b.lat, b.lng, b.photos, b.has_piscine, b.has_garage, b.has_terrasse,
               b.is_featured, b.created_at,
               a.id as acteur_id, a.name as acteur_name, a.type as acteur_type,
               a.slug as acteur_slug, a.phone as acteur_phone, a.email as acteur_email
        FROM biens b
        JOIN acteurs a ON a.id = b.acteur_id
        WHERE b.is_active = true
          AND b.lat IS NOT NULL
        ORDER BY b.is_featured DESC, b.created_at DESC
        LIMIT 500
      `;
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[GET /api/biens]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// POST — Créer un bien (authentification par token acteur)
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...data } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    // Vérifier le token et récupérer l'acteur
    const actors = await sql`
      SELECT id, plan FROM acteurs
      WHERE access_token = ${token} AND is_active = true
      LIMIT 1
    `;

    if (!actors.length) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const acteur = actors[0];

    // Seuls les plans pro/premium peuvent ajouter des biens
    if (acteur.plan === 'free') {
      return NextResponse.json({ error: 'Plan Pro requis pour ajouter des biens' }, { status: 403 });
    }

    // Validation champs obligatoires
    const { type_annonce, type_bien, prix, surface, commune } = data;
    if (!type_annonce || !type_bien || !commune) {
      return NextResponse.json({ error: 'type_annonce, type_bien et commune sont requis' }, { status: 400 });
    }

    // Calcul prix_m2
    const prix_m2 = prix && surface ? Math.round(prix / surface) : null;

    // Titre auto si absent
    const titre = data.titre || `${type_bien} · ${commune}${surface ? ` · ${surface} m²` : ''}`;

    const result = await sql`
      INSERT INTO biens (
        acteur_id, type_annonce, type_bien, titre, description, reference,
        prix, prix_m2, surface, surface_terrain, pieces, chambres, sdb,
        dpe, annee_construction, has_garage, has_piscine, has_terrasse,
        commune, adresse, code_postal, lat, lng, photos
      ) VALUES (
        ${acteur.id},
        ${type_annonce},
        ${type_bien},
        ${titre},
        ${data.description ?? null},
        ${data.reference ?? null},
        ${prix ?? null},
        ${prix_m2},
        ${surface ?? null},
        ${data.surface_terrain ?? null},
        ${data.pieces ?? null},
        ${data.chambres ?? null},
        ${data.sdb ?? null},
        ${data.dpe ?? null},
        ${data.annee_construction ?? null},
        ${data.has_garage ?? false},
        ${data.has_piscine ?? false},
        ${data.has_terrasse ?? false},
        ${commune},
        ${data.adresse ?? null},
        ${data.code_postal ?? null},
        ${data.lat ?? null},
        ${data.lng ?? null},
        ${JSON.stringify(data.photos ?? [])}
      )
      RETURNING id, titre, type_annonce, type_bien, prix, commune
    `;

    return NextResponse.json({ success: true, bien: result[0] }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/biens]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
