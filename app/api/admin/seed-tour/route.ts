/**
 * TERRIMO — GET /api/admin/seed-tour?secret=TERRIMO_TOUR_2026
 * Crée le compte démo Premium + biens + leads + mandat pour le tour du propriétaire.
 * Idempotent : ne recrée pas si le compte démo existe déjà.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const TOUR_SECRET  = 'TERRIMO_TOUR_2026';
const DEMO_TOKEN   = 'demo-premium-terrimo-2026';
const DEMO_EMAIL   = 'demo@terrimo.homes';
const ADMIN_SECRET = 'TERRIMO_ADMIN_2026';

// Photos Unsplash (IDs stables)
const PHOTOS_MAISON = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&q=80',
];
const PHOTOS_APPART = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
];
const PHOTOS_VILLA = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80',
];
const PHOTOS_TERRAIN = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
];

const BIENS_DEMO = [
  // ── Arcachon ─────────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'villa',
    titre: 'Villa pieds dans l\'eau – Vue panoramique Bassin d\'Arcachon',
    description: 'Exceptionnelle villa contemporaine offrant une vue imprenable sur le Bassin d\'Arcachon. 6 pièces sur 185 m², piscine à débordement, terrasse panoramique. Architecture soignée, prestations haut de gamme. Rare à la vente.',
    prix: 1850000, surface: 185, pieces: 6, chambres: 4, dpe: 'C', annee_construction: 2015,
    commune: 'Arcachon', adresse: 'Boulevard de la Plage',
    lat: 44.6609, lng: -1.1733,
    has_piscine: true, has_garage: true, has_terrasse: true, is_featured: true,
    photos: [PHOTOS_VILLA[0], PHOTOS_VILLA[1], PHOTOS_MAISON[0]],
  },
  {
    type_annonce: 'vente', type_bien: 'appartement',
    titre: 'T3 terrasse vue mer – Résidence Le Nautile',
    description: 'Bel appartement 3 pièces entièrement rénové, terrasse de 25 m² avec vue dégagée sur le Bassin. Cuisine équipée, double vitrage, parking sous-sol. Copropriété entretenue.',
    prix: 520000, surface: 72, pieces: 3, chambres: 2, dpe: 'B', annee_construction: 2002,
    commune: 'Arcachon', adresse: 'Avenue Gambetta',
    lat: 44.6580, lng: -1.1680,
    has_garage: true, has_terrasse: true, has_piscine: false, is_featured: false,
    photos: [PHOTOS_APPART[0], PHOTOS_APPART[1]],
  },
  {
    type_annonce: 'vente', type_bien: 'maison',
    titre: 'Maison Ville d\'Hiver – Charme & authenticité',
    description: 'Maison de caractère dans le quartier emblématique de la Ville d\'Hiver. Belle hauteur sous plafond, parquet massif, jardin de 600 m². Travaux de mise aux normes récents.',
    prix: 1250000, surface: 210, pieces: 7, chambres: 5, dpe: 'D', annee_construction: 1905,
    commune: 'Arcachon', adresse: 'Allée des Charmilles',
    lat: 44.6640, lng: -1.1700,
    has_garage: true, has_terrasse: true, has_piscine: false, is_featured: true,
    photos: [PHOTOS_MAISON[1], PHOTOS_MAISON[0]],
  },
  // ── La Teste-de-Buch ──────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'maison',
    titre: 'Villa contemporaine – Proche Dune du Pilat',
    description: 'Villa neuve BBC (Bâtiment Basse Consommation) à 5 min de la Dune du Pilat. 4 chambres, piscine chauffée, garage double. Finitions premium, domotique intégrée.',
    prix: 875000, surface: 155, pieces: 5, chambres: 4, dpe: 'A', annee_construction: 2022,
    commune: 'La Teste-de-Buch', adresse: 'Route de la Dune',
    lat: 44.6272, lng: -1.1333,
    has_piscine: true, has_garage: true, has_terrasse: true, is_featured: false,
    photos: [PHOTOS_VILLA[1], PHOTOS_MAISON[2]],
  },
  {
    type_annonce: 'location', type_bien: 'maison',
    titre: 'Maison 5 pièces – Location annuelle calme',
    description: 'Maison familiale en location annuelle. Jardin clos, garage, proche commerces et école. Loyer charges comprises. Disponible immédiatement.',
    prix: 2200, surface: 118, pieces: 5, chambres: 3, dpe: 'C', annee_construction: 1998,
    commune: 'La Teste-de-Buch', adresse: 'Rue des Pins',
    lat: 44.6310, lng: -1.1290,
    has_garage: true, has_terrasse: true, has_piscine: false, is_featured: false,
    photos: [PHOTOS_MAISON[2], PHOTOS_MAISON[0]],
  },
  // ── Lège-Cap-Ferret ───────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'villa',
    titre: 'Villa Cap Ferret – Accès direct plage océan',
    description: 'Rare opportunité : villa traditionnelle en bois de 220 m² avec accès direct à la plage océan. Terrain de 800 m², terrasse, 5 chambres. Monument naturel. Coup de cœur garanti.',
    prix: 3200000, surface: 220, pieces: 8, chambres: 5, dpe: 'E', annee_construction: 1975,
    commune: 'Lège-Cap-Ferret', adresse: 'Avenue de l\'Océan',
    lat: 44.7500, lng: -1.2000,
    has_piscine: false, has_garage: false, has_terrasse: true, is_featured: true,
    photos: [PHOTOS_VILLA[0], PHOTOS_MAISON[1], PHOTOS_VILLA[1]],
  },
  {
    type_annonce: 'location_saisonniere', type_bien: 'maison',
    titre: 'Cabane ostréicole rénovée – Location saisonnière',
    description: 'Cabane ostréicole authentique entièrement rénovée avec goût. Vue directe sur le Bassin, 4 couchages, terrasse sur pilotis. Expérience unique, réservation à la semaine.',
    prix: 2800, surface: 65, pieces: 3, chambres: 2, dpe: 'D', annee_construction: 1960,
    commune: 'Lège-Cap-Ferret', adresse: 'Port ostréicole',
    lat: 44.7450, lng: -1.1980,
    has_piscine: false, has_garage: false, has_terrasse: true, is_featured: false,
    photos: [PHOTOS_MAISON[0], PHOTOS_MAISON[2]],
  },
  // ── Andernos-les-Bains ────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'maison',
    titre: 'Maison de plage Andernos – 50 m de l\'eau',
    description: 'Maison familiale exceptionnellement bien placée, à 50 mètres de la plage d\'Andernos. Jardin sud, terrasse couverte, 4 chambres. Secteur très recherché.',
    prix: 695000, surface: 128, pieces: 5, chambres: 4, dpe: 'C', annee_construction: 1988,
    commune: 'Andernos-les-Bains', adresse: 'Avenue de la Plage',
    lat: 44.7461, lng: -1.0894,
    has_piscine: false, has_garage: true, has_terrasse: true, is_featured: false,
    photos: [PHOTOS_MAISON[1], PHOTOS_MAISON[2]],
  },
  // ── Gujan-Mestras ─────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'terrain',
    titre: 'Terrain constructible 800 m² – Zone pavillonnaire',
    description: 'Terrain à bâtir de 800 m² en zone pavillonnaire calme. Toutes viabilités en limite de propriété. CU positif. Secteur recherché proche commerces.',
    prix: 185000, surface: 800, dpe: undefined, annee_construction: undefined,
    commune: 'Gujan-Mestras', adresse: 'Chemin des Oyats',
    lat: 44.6369, lng: -1.0681,
    has_piscine: false, has_garage: false, has_terrasse: false, is_featured: false,
    photos: [PHOTOS_TERRAIN[0]],
    pieces: undefined, chambres: undefined,
  },
  {
    type_annonce: 'vente', type_bien: 'maison',
    titre: 'Maison ostréicole rénovée – Port de Larros',
    description: 'Ancienne maison ostréicole entièrement réhabilitée en loft contemporain. Vue sur le port, 3 chambres, grande pièce de vie ouverte sur terrasse. Cachet exceptionnel.',
    prix: 485000, surface: 102, pieces: 4, chambres: 3, dpe: 'B', annee_construction: 1950,
    commune: 'Gujan-Mestras', adresse: 'Port de Larros',
    lat: 44.6350, lng: -1.0720,
    has_piscine: false, has_garage: false, has_terrasse: true, is_featured: false,
    photos: [PHOTOS_MAISON[0], PHOTOS_APPART[1]],
  },
];

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== TOUR_SECRET) {
    return NextResponse.json({ error: 'Secret invalide' }, { status: 401 });
  }

  try {
    // ── 1. Upsert l'acteur démo premium ──────────────────────
    let acteurId: number;

    const existing = await sql`
      SELECT id FROM acteurs WHERE email = ${DEMO_EMAIL} LIMIT 1
    `;

    if (existing.length) {
      acteurId = existing[0].id as number;
      await sql`
        UPDATE acteurs SET
          plan = 'premium', is_active = true, is_verified = true,
          access_token = ${DEMO_TOKEN},
          updated_at = NOW()
        WHERE id = ${acteurId}
      `;
    } else {
      const ins = await sql`
        INSERT INTO acteurs (
          type, name, slug, email, phone, website,
          address, commune, description,
          plan, is_active, is_verified, access_token,
          google_rating, google_reviews,
          created_at, updated_at
        ) VALUES (
          'agence',
          'Agence Terrimo Démo',
          'agence-terrimo-demo',
          ${DEMO_EMAIL},
          '05 56 00 00 00',
          'https://terrimo.homes',
          '12 Avenue du Général de Gaulle',
          'Arcachon',
          'Agence immobilière de démonstration Terrimo — spécialiste du Bassin d''Arcachon depuis 15 ans. Vente, location, gestion locative.',
          'premium', true, true,
          ${DEMO_TOKEN},
          4.8, 127,
          NOW(), NOW()
        )
        RETURNING id
      `;
      acteurId = ins[0].id as number;
    }

    // ── 2. Supprimer les anciens biens démo ──────────────────
    await sql`DELETE FROM biens WHERE acteur_id = ${acteurId}`;

    // ── 3. Insérer les biens démo ────────────────────────────
    const biensInserted: number[] = [];
    for (const b of BIENS_DEMO) {
      const photos = b.photos.map(url => ({ url }));
      const prixM2 = b.prix && b.surface ? Math.round(b.prix / b.surface) : null;
      const res = await sql`
        INSERT INTO biens (
          acteur_id, type_annonce, type_bien, titre, description,
          prix, prix_m2, surface, pieces, chambres, dpe, annee_construction,
          commune, adresse, lat, lng,
          has_piscine, has_garage, has_terrasse, is_featured, is_active,
          photos
        ) VALUES (
          ${acteurId}, ${b.type_annonce}, ${b.type_bien},
          ${b.titre}, ${b.description ?? null},
          ${b.prix ?? null}, ${prixM2}, ${b.surface ?? null},
          ${b.pieces ?? null}, ${b.chambres ?? null},
          ${b.dpe ?? null}, ${b.annee_construction ?? null},
          ${b.commune}, ${b.adresse ?? null},
          ${b.lat}, ${b.lng},
          ${b.has_piscine}, ${b.has_garage}, ${b.has_terrasse},
          ${b.is_featured}, true,
          ${JSON.stringify(photos)}
        )
        RETURNING id
      `;
      biensInserted.push(res[0].id as number);
    }

    // ── 4. Insérer des leads démo ────────────────────────────
    const leads = [
      { name: 'Jean-Pierre Moreau', email: 'jp.moreau@gmail.com', phone: '06 12 34 56 78', commune: 'Arcachon', type_local: 'Maison', surface: 150, estimation_centrale: 1100000, source: 'evaluer' },
      { name: 'Sophie Leblanc',     email: 'sophie.lb@orange.fr', phone: '06 98 76 54 32', commune: 'La Teste-de-Buch', type_local: 'Maison', surface: 120, estimation_centrale: 680000, source: 'vendre_vendre' },
      { name: 'Marc Durand',        email: 'marc.d@hotmail.fr',   phone: '07 65 43 21 09', commune: 'Gujan-Mestras', type_local: 'Appartement', surface: 68, estimation_centrale: 320000, source: 'evaluer' },
      { name: 'Isabelle Fontaine',  email: 'isabelle.f@free.fr',  phone: '06 45 67 89 01', commune: 'Andernos-les-Bains', type_local: 'Maison', surface: 95, estimation_centrale: 520000, source: 'evaluer' },
    ];

    for (const l of leads) {
      await sql`
        INSERT INTO leads (name, email, phone, commune, type_local, surface, estimation_centrale, source, status)
        VALUES (${l.name}, ${l.email}, ${l.phone}, ${l.commune}, ${l.type_local}, ${l.surface}, ${l.estimation_centrale}, ${l.source}, 'new')
        ON CONFLICT DO NOTHING
      `.catch(() => {});
    }

    // ── 5. Insérer mandats_recherche démo ────────────────────
    await sql`
      INSERT INTO mandats_recherche (
        email, phone, prenom, type_acquisition, horizon, communes,
        types_bien, surface_min, surface_max, chambres_min,
        budget_max, apport, mode_financement, accord_bancaire,
        caracteristiques, description, is_active
      ) VALUES
      ('acheteur1@example.com', '06 11 22 33 44', 'Thomas', 'residence_principale', '3mois',
       ARRAY['Arcachon','La Teste-de-Buch'], ARRAY['maison','villa'],
       120, 200, 3, 900000, 200000, 'credit', true,
       ARRAY['piscine','garage'], 'Cherche villa avec vue mer, budget flexible pour le bien idéal.', true),
      ('acheteur2@example.com', '06 55 66 77 88', 'Claire', 'residence_secondaire', '6mois',
       ARRAY['Lège-Cap-Ferret'], ARRAY['maison'],
       80, 130, 2, 650000, 300000, 'comptant', false,
       ARRAY['terrasse'], 'Résidence secondaire côté Bassin ou océan, charme authentique.', true),
      ('acheteur3@example.com', '06 99 00 11 22', 'Romain', 'investissement', 'sans_urgence',
       ARRAY['Gujan-Mestras','Andernos-les-Bains'], ARRAY['appartement','maison'],
       50, 90, 2, 380000, 80000, 'credit', true,
       ARRAY['garage'], 'Investissement locatif, rentabilité prioritaire, ouvert à tous secteurs.', true)
      ON CONFLICT DO NOTHING
    `.catch(() => {});

    return NextResponse.json({
      ok: true,
      acteur_id: acteurId,
      dashboard_url: `https://terrimo.homes/pro/dashboard/${DEMO_TOKEN}`,
      dashboard_token: DEMO_TOKEN,
      admin_secret: ADMIN_SECRET,
      admin_url: `https://terrimo.homes/admin/${ADMIN_SECRET}`,
      migrate_url_stripe: `https://terrimo.homes/api/admin/migrate?secret=${ADMIN_SECRET}&migration=stripe`,
      migrate_url_mandats: `https://terrimo.homes/api/admin/migrate?secret=${ADMIN_SECRET}&migration=mandats`,
      biens_inserted: biensInserted.length,
      biens_ids: biensInserted,
      message: `Compte démo Premium créé. Token: ${DEMO_TOKEN}`,
    });

  } catch (err) {
    console.error('[seed-tour]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
