/**
 * TERRIMO — POST /api/pro/import-csv
 * Import en masse de biens depuis un CSV pro
 *
 * Limites par plan :
 *   free    → refusé (max 1 bien via dashboard)
 *   pro     → max 20 biens par import, 50 biens total actifs
 *   premium → illimité (max 200 par fichier)
 *
 * Format CSV attendu (séparateur virgule, UTF-8 avec BOM optionnel) :
 *   type_annonce, type_bien, titre, prix, surface, pieces, chambres,
 *   commune, adresse, dpe, annee_construction, has_piscine, has_garage,
 *   has_terrasse, description, photo_url_1, photo_url_2, photo_url_3
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// ─── Config par plan ──────────────────────────────────────────────────────────
const LIMITS = {
  free:    { perImport: 0,   totalActifs: 1   },
  pro:     { perImport: 20,  totalActifs: 50  },
  premium: { perImport: 200, totalActifs: 9999 },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
const VALID_TYPE_ANNONCE = ['vente', 'location', 'location_saisonniere'] as const;
const VALID_TYPE_BIEN    = ['maison', 'appartement', 'villa', 'terrain', 'immeuble', 'commerce', 'autre'] as const;
const VALID_DPE          = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

// Communes du Bassin → mapping communes DVF
const COMMUNE_CENTERS: Record<string, { lat: number; lng: number }> = {
  'arcachon':           { lat: 44.6522, lng: -1.1675 },
  'la-teste-de-buch':   { lat: 44.6272, lng: -1.1333 },
  'lege-cap-ferret':    { lat: 44.7500, lng: -1.2000 },
  'andernos-les-bains': { lat: 44.7461, lng: -1.0894 },
  'gujan-mestras':      { lat: 44.6369, lng: -1.0681 },
  'le-teich':           { lat: 44.6364, lng: -1.0211 },
  'audenge':            { lat: 44.6876, lng: -1.0167 },
  'biganos':            { lat: 44.6618, lng: -0.9754 },
  'mios':               { lat: 44.5967, lng: -0.9347 },
  'salles':             { lat: 44.5500, lng: -0.8667 },
  'marcheprime':        { lat: 44.6833, lng: -0.9000 },
  'biscarrosse':        { lat: 44.3942, lng: -1.1661 },
  'cazaux':             { lat: 44.5392, lng: -1.1519 },
};

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[àáâã]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseCSV(text: string): string[][] {
  // Enlève le BOM UTF-8 si présent
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter(l => l.trim());
  return lines.map(line => {
    const cells: string[] = [];
    let inQ = false, cur = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    cells.push(cur.trim());
    return cells;
  });
}

function bool(s: string): boolean {
  return ['1', 'true', 'oui', 'yes', 'o', 'y'].includes(s.toLowerCase().trim());
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });

    // ── Auth ────────────────────────────────────────────────────────────────
    const rows = await sql`
      SELECT id, plan, commune, name, email
      FROM acteurs
      WHERE access_token = ${token} AND is_active = true
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    const { id: acteurId, plan, commune, name } = rows[0] as {
      id: number; plan: string; commune: string; name: string; email: string;
    };

    const limits = LIMITS[plan as keyof typeof LIMITS] ?? LIMITS.free;

    if (limits.perImport === 0) {
      return NextResponse.json({ error: 'L\'import CSV est disponible à partir du plan Pro.' }, { status: 403 });
    }

    // ── Lire le fichier ──────────────────────────────────────────────────────
    const contentType = request.headers.get('content-type') ?? '';
    let csvText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) return NextResponse.json({ error: 'Fichier CSV manquant (champ "file")' }, { status: 400 });
      csvText = await file.text();
    } else {
      csvText = await request.text();
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: 'Fichier CSV vide' }, { status: 400 });
    }

    // ── Vérifier le quota actuel ─────────────────────────────────────────────
    const countRow = await sql`SELECT COUNT(*)::int AS nb FROM biens WHERE acteur_id = ${acteurId} AND is_active = true`;
    const currentActifs = countRow[0]?.nb ?? 0;
    if (currentActifs >= limits.totalActifs) {
      return NextResponse.json({ error: `Quota atteint : ${currentActifs}/${limits.totalActifs} biens actifs sur votre plan ${plan}.` }, { status: 403 });
    }

    // ── Parser le CSV ────────────────────────────────────────────────────────
    const allRows = parseCSV(csvText);
    if (allRows.length < 2) {
      return NextResponse.json({ error: 'CSV invalide (au moins une ligne de données requise)' }, { status: 400 });
    }

    // Détecter l'en-tête (ignorer si première ligne ressemble à des colonnes)
    const HEADER_KEYWORDS = ['type', 'titre', 'prix', 'surface', 'commune'];
    const hasHeader = HEADER_KEYWORDS.some(k => allRows[0].join(',').toLowerCase().includes(k));
    const dataRows  = hasHeader ? allRows.slice(1) : allRows;

    const maxRows = Math.min(dataRows.length, limits.perImport, limits.totalActifs - currentActifs);
    const toProcess = dataRows.slice(0, maxRows);

    const inserted: number[] = [];
    const errors:   { line: number; error: string }[] = [];

    for (let i = 0; i < toProcess.length; i++) {
      const row = toProcess[i];
      const lineNum = i + (hasHeader ? 2 : 1);

      try {
        // Colonnes (0-indexées) :
        // 0:type_annonce 1:type_bien 2:titre 3:prix 4:surface 5:pieces 6:chambres
        // 7:commune 8:adresse 9:dpe 10:annee_construction 11:has_piscine 12:has_garage
        // 13:has_terrasse 14:description 15:photo_url_1 16:photo_url_2 17:photo_url_3
        const [
          rawTypeAnnonce, rawTypeBien, titre, rawPrix, rawSurface,
          rawPieces, rawChambres, rawCommune, adresse, rawDpe,
          rawAnnee, rawPiscine, rawGarage, rawTerrasse, description,
          photo1, photo2, photo3,
        ] = row;

        const type_annonce = rawTypeAnnonce?.toLowerCase().replace(/\s+/g, '_') as typeof VALID_TYPE_ANNONCE[number];
        const type_bien    = rawTypeBien?.toLowerCase() as typeof VALID_TYPE_BIEN[number];

        if (!VALID_TYPE_ANNONCE.includes(type_annonce)) {
          errors.push({ line: lineNum, error: `type_annonce invalide: "${rawTypeAnnonce}" (attendu: vente|location|location_saisonniere)` });
          continue;
        }
        if (!VALID_TYPE_BIEN.includes(type_bien)) {
          errors.push({ line: lineNum, error: `type_bien invalide: "${rawTypeBien}" (attendu: maison|appartement|villa|terrain|immeuble|commerce|autre)` });
          continue;
        }

        const prix    = rawPrix    ? Number(rawPrix.replace(/[\s€,]/g, ''))  : null;
        const surface = rawSurface ? Number(rawSurface.replace(/\s/g, ''))  : null;
        const pieces  = rawPieces  ? Number(rawPieces)   : null;
        const chambres = rawChambres ? Number(rawChambres) : null;
        const dpe     = VALID_DPE.includes(rawDpe?.toUpperCase() as typeof VALID_DPE[number])
          ? rawDpe.toUpperCase() : null;
        const annee_construction = rawAnnee ? Number(rawAnnee) : null;

        // Commune : utilise la colonne si fournie, sinon commune de l'acteur
        const communeRaw = rawCommune?.trim() || commune;
        const communeSlug = slugify(communeRaw);
        const coords = COMMUNE_CENTERS[communeSlug];
        const lat = coords ? coords.lat + (Math.random() - 0.5) * 0.006 : null;
        const lng = coords ? coords.lng + (Math.random() - 0.5) * 0.006 : null;

        // Photos
        const photos: { url: string }[] = [photo1, photo2, photo3]
          .filter(u => u?.startsWith('http'))
          .map(url => ({ url }));

        const result = await sql`
          INSERT INTO biens (
            acteur_id, type_annonce, type_bien, titre, prix, surface, pieces, chambres,
            commune, adresse, dpe, annee_construction, has_piscine, has_garage, has_terrasse,
            description, photos, lat, lng, is_active, is_featured
          ) VALUES (
            ${acteurId}, ${type_annonce}, ${type_bien},
            ${titre?.trim() || null},
            ${prix}, ${surface}, ${pieces}, ${chambres},
            ${communeRaw}, ${adresse?.trim() || null},
            ${dpe}, ${annee_construction},
            ${bool(rawPiscine ?? '')}, ${bool(rawGarage ?? '')}, ${bool(rawTerrasse ?? '')},
            ${description?.trim() || null},
            ${JSON.stringify(photos)},
            ${lat}, ${lng},
            true, false
          )
          RETURNING id
        `;
        inserted.push(result[0].id as number);
      } catch (err) {
        errors.push({ line: lineNum, error: String(err) });
      }
    }

    const skipped = Math.max(0, dataRows.length - maxRows);

    return NextResponse.json({
      ok: true,
      inserted: inserted.length,
      errors,
      skipped,
      message: `${inserted.length} bien${inserted.length > 1 ? 's' : ''} importé${inserted.length > 1 ? 's' : ''} pour ${name}.${skipped > 0 ? ` ${skipped} ligne${skipped > 1 ? 's' : ''} ignorée${skipped > 1 ? 's' : ''} (quota).` : ''}`,
    });

  } catch (err) {
    console.error('[/api/pro/import-csv]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
