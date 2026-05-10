/**
 * TERRIMO — Seed biens démo
 * GET /api/admin/seed-demo?secret=TERRIMO_SEED_2026
 *
 * Insère 20 biens démo réalistes sur le Bassin d'Arcachon.
 * Protégé par secret query param. Usage unique (vérifie si biens existent déjà).
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const SEED_SECRET = process.env.SEED_SECRET ?? 'TERRIMO_SEED_2026';

const DEMO_BIENS = [
  // ── Arcachon ──────────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Villa', commune: 'Arcachon',
    titre: 'Villa pieds dans l\'eau - Vue panoramique Bassin',
    prix: 1850000, surface: 185, pieces: 6, chambres: 4, dpe: 'C',
    lat: 44.6609, lng: -1.1733,
    has_piscine: true, has_garage: true, has_terrasse: true, is_featured: true,
    adresse: 'Boulevard de la Plage',
  },
  {
    type_annonce: 'vente', type_bien: 'Appartement', commune: 'Arcachon',
    titre: 'T3 avec terrasse et vue mer - Résidence standing',
    prix: 520000, surface: 72, pieces: 3, chambres: 2, dpe: 'B',
    lat: 44.6580, lng: -1.1680,
    has_garage: true, has_terrasse: true,
    adresse: 'Avenue Gambetta',
  },
  {
    type_annonce: 'location', type_bien: 'Villa', commune: 'Arcachon',
    titre: 'Villa Ville d\'Hiver - Charme & caractère',
    prix: 3800, surface: 210, pieces: 7, chambres: 5, dpe: 'D',
    lat: 44.6640, lng: -1.1700,
    has_garage: true, has_terrasse: true, has_piscine: false,
    adresse: 'Allée des Charmilles',
  },
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Arcachon',
    titre: 'Maison de ville rénovée - Quartier Abatilles',
    prix: 780000, surface: 140, pieces: 5, chambres: 3, dpe: 'C',
    lat: 44.6595, lng: -1.1760,
    has_terrasse: true, has_garage: false,
    adresse: 'Rue du Maréchal Foch',
  },
  // ── La Teste-de-Buch ──────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Villa', commune: 'La Teste-de-Buch',
    titre: 'Villa contemporaine - Vue Dune du Pilat',
    prix: 1250000, surface: 220, pieces: 7, chambres: 5, dpe: 'A',
    lat: 44.6240, lng: -1.1390,
    has_piscine: true, has_garage: true, has_terrasse: true, is_featured: true,
    adresse: 'Route de la Dune',
  },
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'La Teste-de-Buch',
    titre: 'Maison traditionnelle - Terrain 1200m²',
    prix: 680000, surface: 160, pieces: 5, chambres: 3, dpe: 'D',
    lat: 44.6310, lng: -1.1250,
    has_garage: true, has_terrasse: true,
    adresse: 'Chemin des Pins',
  },
  {
    type_annonce: 'location', type_bien: 'Appartement', commune: 'La Teste-de-Buch',
    titre: 'T2 neuf proche centre - Résidence Les Oyats',
    prix: 900, surface: 48, pieces: 2, chambres: 1, dpe: 'A',
    lat: 44.6290, lng: -1.1210,
    has_terrasse: true,
    adresse: 'Rue de la Libération',
  },
  // ── Lège-Cap-Ferret ────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Villa', commune: 'Lège-Cap-Ferret',
    titre: 'Villa Cap Ferret - Accès direct bassin',
    prix: 3200000, surface: 280, pieces: 8, chambres: 6, dpe: 'C',
    lat: 44.6960, lng: -1.2520,
    has_piscine: true, has_garage: true, has_terrasse: true, is_featured: true,
    adresse: 'Allée des Goélands',
  },
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Lège-Cap-Ferret',
    titre: 'Cabane ostréicole rénovée - Village du Canon',
    prix: 950000, surface: 110, pieces: 4, chambres: 2, dpe: 'E',
    lat: 44.7380, lng: -1.2380,
    has_terrasse: true,
    adresse: 'Port du Canon',
  },
  {
    type_annonce: 'location', type_bien: 'Villa', commune: 'Lège-Cap-Ferret',
    titre: 'Villa Bélisaire - Piscine & vue bassin',
    prix: 5500, surface: 190, pieces: 6, chambres: 4, dpe: 'C',
    lat: 44.7100, lng: -1.2490,
    has_piscine: true, has_terrasse: true, has_garage: false,
    adresse: 'Avenue Bélisaire',
  },
  // ── Gujan-Mestras ─────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Gujan-Mestras',
    titre: 'Maison d\'architecte - Quartier calme résidentiel',
    prix: 890000, surface: 175, pieces: 6, chambres: 4, dpe: 'B',
    lat: 44.6340, lng: -1.0710,
    has_piscine: true, has_garage: true, has_terrasse: true,
    adresse: 'Avenue de la Gare',
  },
  {
    type_annonce: 'vente', type_bien: 'Appartement', commune: 'Gujan-Mestras',
    titre: 'T4 - Résidence Les Ports - Vue port ostréicole',
    prix: 420000, surface: 95, pieces: 4, chambres: 2, dpe: 'C',
    lat: 44.6370, lng: -1.0730,
    has_terrasse: true, has_garage: true,
    adresse: 'Rue des Ports',
  },
  {
    type_annonce: 'location', type_bien: 'Maison', commune: 'Gujan-Mestras',
    titre: 'Maison avec jardin - Proche plages lac',
    prix: 1650, surface: 120, pieces: 4, chambres: 3, dpe: 'D',
    lat: 44.6355, lng: -1.0680,
    has_terrasse: true, has_garage: false,
    adresse: 'Chemin du Lac',
  },
  // ── Andernos-les-Bains ────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Villa', commune: 'Andernos-les-Bains',
    titre: 'Villa en bord de bassin - Belle luminosité',
    prix: 1100000, surface: 165, pieces: 6, chambres: 4, dpe: 'C',
    lat: 44.7410, lng: -1.0980,
    has_terrasse: true, has_garage: true, has_piscine: false, is_featured: true,
    adresse: 'Boulevard du Président Roosevelt',
  },
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Andernos-les-Bains',
    titre: 'Charmante maison landaise - Jardin planté',
    prix: 495000, surface: 118, pieces: 4, chambres: 3, dpe: 'E',
    lat: 44.7380, lng: -1.0930,
    has_terrasse: true, has_garage: false,
    adresse: 'Allée des Mimosas',
  },
  // ── Biganos ───────────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Biganos',
    titre: 'Maison neuve BBC - Lotissement Les Pins',
    prix: 390000, surface: 105, pieces: 4, chambres: 3, dpe: 'A',
    lat: 44.6490, lng: -0.9780,
    has_terrasse: true, has_garage: true,
    adresse: 'Rue des Érables',
  },
  // ── Marcheprime ───────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Marcheprime',
    titre: 'Belle maison avec piscine - Calme absolu',
    prix: 445000, surface: 140, pieces: 5, chambres: 3, dpe: 'C',
    lat: 44.6950, lng: -0.9270,
    has_piscine: true, has_terrasse: true, has_garage: true,
    adresse: 'Impasse des Cèdres',
  },
  // ── Audenge ───────────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Maison', commune: 'Audenge',
    titre: 'Maison de village rénovée - Vue bassin',
    prix: 530000, surface: 130, pieces: 5, chambres: 3, dpe: 'D',
    lat: 44.6840, lng: -1.0190,
    has_terrasse: true, has_garage: false,
    adresse: 'Route du Bassin',
  },
  // ── Lanton ────────────────────────────────────────────────
  {
    type_annonce: 'location', type_bien: 'Maison', commune: 'Lanton',
    titre: 'Location longue durée - Maison 4p - Jardin',
    prix: 1400, surface: 100, pieces: 4, chambres: 2, dpe: 'C',
    lat: 44.7010, lng: -1.0420,
    has_terrasse: true, has_garage: true,
    adresse: 'Avenue du Général de Gaulle',
  },
  // ── Arès ──────────────────────────────────────────────────
  {
    type_annonce: 'vente', type_bien: 'Villa', commune: 'Arès',
    titre: 'Villa Arès - Rare, 200m bassin, piscine chauffée',
    prix: 1580000, surface: 200, pieces: 7, chambres: 5, dpe: 'B',
    lat: 44.7690, lng: -1.1350,
    has_piscine: true, has_terrasse: true, has_garage: true, is_featured: true,
    adresse: 'Chemin des Dunes',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Vérifier si des biens démo existent déjà
    const existing = await sql`SELECT COUNT(*) as cnt FROM biens`;
    const count = parseInt(existing[0].cnt as string, 10);
    const force = searchParams.get('force') === '1';

    if (count > 0 && !force) {
      return NextResponse.json({
        message: `${count} biens existent déjà. Utilisez &force=1 pour réinitialiser.`,
        count,
      });
    }

    if (count > 0 && force) {
      await sql`DELETE FROM biens`;
    }

    // Trouver le premier acteur avec un plan non-free
    const acteurs = await sql`
      SELECT id, name FROM acteurs
      WHERE is_active = true
      ORDER BY
        CASE plan
          WHEN 'premium' THEN 1
          WHEN 'pro'     THEN 2
          WHEN 'starter' THEN 3
          ELSE 4
        END,
        created_at ASC
      LIMIT 5
    `;

    if (!acteurs.length) {
      return NextResponse.json({ error: 'Aucun acteur trouvé en base. Importez d\'abord les acteurs.' }, { status: 400 });
    }

    // Distribuer les biens sur les 5 premiers acteurs (round-robin)
    let inserted = 0;
    for (let i = 0; i < DEMO_BIENS.length; i++) {
      const b = DEMO_BIENS[i];
      const acteur = acteurs[i % acteurs.length];
      const prix_m2 = b.prix && b.surface ? Math.round(b.prix / b.surface) : null;

      await sql`
        INSERT INTO biens (
          acteur_id, type_annonce, type_bien, titre,
          prix, prix_m2, surface, pieces, chambres, dpe,
          commune, adresse, lat, lng,
          has_piscine, has_garage, has_terrasse, is_featured,
          is_active, photos
        ) VALUES (
          ${acteur.id},
          ${b.type_annonce},
          ${b.type_bien},
          ${b.titre},
          ${b.prix ?? null},
          ${prix_m2},
          ${b.surface ?? null},
          ${b.pieces ?? null},
          ${b.chambres ?? null},
          ${b.dpe ?? null},
          ${b.commune},
          ${b.adresse ?? null},
          ${b.lat},
          ${b.lng},
          ${b.has_piscine ?? false},
          ${b.has_garage ?? false},
          ${b.has_terrasse ?? false},
          ${(b as any).is_featured ?? false},
          true,
          '[]'::jsonb
        )
      `;
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `${inserted} biens démo insérés avec succès.`,
      inserted,
      acteurs_used: acteurs.map(a => ({ id: a.id, name: a.name })),
    });

  } catch (err) {
    console.error('[GET /api/admin/seed-demo]', err);
    return NextResponse.json({ error: 'Erreur serveur', detail: String(err) }, { status: 500 });
  }
}
