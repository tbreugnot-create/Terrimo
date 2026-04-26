/**
 * TERRIMO — API d'estimation immobilière
 * POST /api/evaluer
 *
 * Calcule une fourchette de prix basée sur :
 * - Données DVF (prix médian/m² par commune + type)
 * - Coefficients factuels (DPE, état, vue mer, distance mer)
 * - Ajustements subjectifs
 *
 * Fallback sur prix de marché hardcodés si DVF non importé.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ZONES_BY_COMMUNE } from '@/lib/zones';

// ============================================================
// PRIX DE MARCHÉ FALLBACK (médiane 2023/2024 estimée)
// ============================================================
// Médiane marché 2024-2025 (correction -8 à -15% vs pic 2021-2022)
// Sources: notaires.fr, MeilleursAgents, DVF annualisé
const PRIX_FALLBACK: Record<string, Record<string, number>> = {
  'ARCACHON':           { Maison: 7500,  Appartement: 6200 },  // -12% vs 2022
  'LA TESTE-DE-BUCH':   { Maison: 8200,  Appartement: 6000 },  // -11% (Pyla hors zone)
  'LEGE-CAP-FERRET':    { Maison: 10500, Appartement: 7200 },  // -9% (marché très tendu)
  'ANDERNOS-LES-BAINS': { Maison: 4900,  Appartement: 4000 },  // -11%
  'ARES':               { Maison: 4700,  Appartement: 3800 },  // -10%
  'GUJAN-MESTRAS':      { Maison: 4500,  Appartement: 4000 },  // -10%
  'LANTON':             { Maison: 4100,  Appartement: 3500 },  // -9%
  'BIGANOS':            { Maison: 3700,  Appartement: 3200 },  // -8%
  'AUDENGE':            { Maison: 3900,  Appartement: 3300 },  // -9%
  'LE TEICH':           { Maison: 3800,  Appartement: 3200 },  // -7%
  'MIOS':               { Maison: 3200,  Appartement: 2800 },  // marché forestier accessible
  'SALLES':             { Maison: 3000,  Appartement: 2600 },  // marché périphérique
};

// ============================================================
// COEFFICIENTS DPE
// ============================================================
const COEF_DPE: Record<string, number> = {
  'A': 1.05,
  'B': 1.02,
  'C': 1.00,
  'D': 0.97,
  'E': 0.92,
  'F': 0.86,
  'G': 0.80,
};

// ============================================================
// COEFFICIENTS ÉTAT GÉNÉRAL
// ============================================================
const COEF_ETAT: Record<string, number> = {
  'neuf':      1.10,
  'bon':       1.02,
  'travaux':   0.90,
  'renover':   0.82,
};

// ============================================================
// TYPES
// ============================================================
interface EvaluerRequest {
  commune: string;           // ex: "ARCACHON"
  type_local: string;        // "Maison" | "Appartement"
  surface: number;           // m²
  pieces?: number;
  annee_construction?: number;
  dpe?: string;              // A–G
  has_piscine?: boolean;
  garages?: number;
  // Critères Bassin
  distance_mer?: number;     // mètres
  vue_mer?: boolean;
  front_de_mer?: boolean;
  // Micro-zone
  zone?: string;             // ex: "ville-hiver", "face-ocean", "pyla" …
  // Spécificités Bassin d'Arcachon
  quartier_ostreicole?: boolean;
  villa_dans_les_pins?: boolean;
  acces_bassin_direct?: boolean;
  // Critères subjectifs (0–5)
  etat_general?: string;     // 'neuf' | 'bon' | 'travaux' | 'renover'
  luminosite?: number;       // 1–5
  nuisances?: number;        // 1–5 (5 = aucune nuisance)
  vis_a_vis?: number;        // 1–5 (5 = intimité totale)
  standing?: number;         // 1–5
  charme?: number;           // 1–5
  finitions?: number;        // 1–5
}

interface Comparable {
  date: string;
  valeur: number;
  surface: number;
  prix_m2: number;
  type: string;
  lat?: number;
  lng?: number;
}

interface EvaluerResponse {
  prix_m2_base: number;
  prix_m2_final: number;
  estimation_min: number;
  estimation_centrale: number;
  estimation_max: number;
  surface: number;
  commune: string;
  type_local: string;
  nb_transactions: number;
  source: 'dvf' | 'fallback';
  comparables: Comparable[];
  zone_label?: string;
  coefficients: {
    zone: number;
    dpe: number;
    etat: number;
    vue_mer: number;
    distance_mer: number;
    piscine: number;
    bassin: number;
    subjectif: number;
  };
}

// ============================================================
// HANDLER
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body: EvaluerRequest = await request.json();
    const {
      commune,
      type_local,
      surface,
      zone,
      quartier_ostreicole = false,
      villa_dans_les_pins = false,
      acces_bassin_direct = false,
      dpe = 'D',
      etat_general = 'bon',
      has_piscine = false,
      garages = 0,
      distance_mer,
      vue_mer = false,
      front_de_mer = false,
      luminosite = 3,
      nuisances = 3,
      vis_a_vis = 3,
      standing = 3,
      charme = 3,
      finitions = 3,
    } = body;

    if (!commune || !type_local || !surface || surface < 10) {
      return NextResponse.json(
        { error: 'Paramètres manquants ou invalides' },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // 1. Prix de base — DVF ou fallback
    // --------------------------------------------------------
    let prix_m2_base: number;
    let nb_transactions = 0;
    let source: 'dvf' | 'fallback' = 'fallback';
    let comparables: Comparable[] = [];

    try {
      // Essai DVF — 3 dernières années, filtrer les valeurs aberrantes
      const dvfResult = await sql`
        SELECT
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prix_m2)::numeric, 0) AS mediane,
          COUNT(*) AS nb,
          ROUND(AVG(prix_m2)::numeric, 0) AS moyenne
        FROM dvf_transactions
        WHERE commune = ${commune}
          AND type_local = ${type_local}
          AND annee >= 2022
          AND prix_m2 > 1000
          AND prix_m2 < 50000
          AND surface_reelle_bati BETWEEN ${Math.max(10, surface * 0.5)} AND ${surface * 2.5}
      `;

      const row = dvfResult[0];

      if (row && row.nb && parseInt(row.nb) >= 5 && row.mediane) {
        prix_m2_base = parseFloat(row.mediane);
        nb_transactions = parseInt(row.nb);
        source = 'dvf';

        // Récupérer les comparables récents
        const compResult = await sql`
          SELECT
            to_char(date_mutation, 'MM/YYYY') AS date,
            valeur_fonciere AS valeur,
            surface_reelle_bati AS surface,
            prix_m2,
            type_local AS type,
            lat,
            lng
          FROM dvf_transactions
          WHERE commune = ${commune}
            AND type_local = ${type_local}
            AND annee >= 2022
            AND prix_m2 > 1000
            AND prix_m2 < 50000
          ORDER BY date_mutation DESC
          LIMIT 10
        `;
        comparables = compResult as Comparable[];
      } else {
        throw new Error('Pas assez de données DVF');
      }
    } catch {
      // Fallback sur prix de marché hardcodés
      const communePrix = PRIX_FALLBACK[commune] ?? PRIX_FALLBACK['GUJAN-MESTRAS'];
      prix_m2_base = communePrix[type_local] ?? communePrix['Maison'];
      source = 'fallback';
    }

    // --------------------------------------------------------
    // 2. Application des coefficients
    // --------------------------------------------------------

    // Micro-zone (Bassin d'Arcachon)
    let coef_zone = 1.0;
    let zone_label: string | undefined;
    if (zone && ZONES_BY_COMMUNE[commune]) {
      const zoneObj = ZONES_BY_COMMUNE[commune].find((z) => z.value === zone);
      if (zoneObj) {
        coef_zone = zoneObj.coef;
        zone_label = zoneObj.label;
      }
    }

    // Spécificités Bassin d'Arcachon
    let coef_bassin = 1.0;
    if (acces_bassin_direct) coef_bassin *= 1.18;
    if (quartier_ostreicole) coef_bassin *= 1.08;
    if (villa_dans_les_pins) coef_bassin *= 1.06;

    // DPE
    const coef_dpe = COEF_DPE[dpe.toUpperCase()] ?? 1.0;

    // État général
    const coef_etat = COEF_ETAT[etat_general] ?? 1.0;

    // Vue mer / front de mer
    let coef_vue = 1.0;
    if (front_de_mer) coef_vue = 1.30;
    else if (vue_mer) coef_vue = 1.20;

    // Distance mer
    let coef_distance = 1.0;
    if (distance_mer !== undefined) {
      if (distance_mer <= 200)       coef_distance = 1.25;
      else if (distance_mer <= 500)  coef_distance = 1.15;
      else if (distance_mer <= 1000) coef_distance = 1.05;
      else if (distance_mer <= 2000) coef_distance = 1.00;
      else                           coef_distance = 0.95;
    }

    // Piscine
    const coef_piscine = has_piscine ? 1.05 : 1.0;

    // Garage / parking
    const coef_garage = garages > 0 ? (1 + garages * 0.015) : 1.0;

    // Critères subjectifs — pondérés sur une échelle normalisée
    // Note moyenne (1–5) → coefficient centré sur 1.0 avec amplitude ±8%
    const notes_subjectif = [luminosite, nuisances, vis_a_vis, standing, charme, finitions];
    const note_moy = notes_subjectif.reduce((a, b) => a + b, 0) / notes_subjectif.length;
    const coef_subjectif = 1 + (note_moy - 3) * 0.04; // plage : 0.92 → 1.08

    // Coefficient total
    const coef_total =
      coef_zone *
      coef_bassin *
      coef_dpe *
      coef_etat *
      coef_vue *
      coef_distance *
      coef_piscine *
      coef_garage *
      coef_subjectif;

    const prix_m2_final = Math.round(prix_m2_base * coef_total);

    // --------------------------------------------------------
    // 3. Calcul de la fourchette
    // --------------------------------------------------------
    const valeur_centrale = prix_m2_final * surface;
    const marge = source === 'dvf' ? 0.08 : 0.12; // ±8% DVF, ±12% fallback

    const estimation_min     = Math.round((valeur_centrale * (1 - marge)) / 1000) * 1000;
    const estimation_centrale = Math.round(valeur_centrale / 1000) * 1000;
    const estimation_max     = Math.round((valeur_centrale * (1 + marge)) / 1000) * 1000;

    const response: EvaluerResponse = {
      prix_m2_base,
      prix_m2_final,
      estimation_min,
      estimation_centrale,
      estimation_max,
      surface,
      commune,
      type_local,
      nb_transactions,
      source,
      comparables,
      zone_label,
      coefficients: {
        zone: Math.round(coef_zone * 100) / 100,
        dpe: coef_dpe,
        etat: coef_etat,
        vue_mer: coef_vue,
        distance_mer: coef_distance,
        piscine: coef_piscine,
        bassin: Math.round(coef_bassin * 100) / 100,
        subjectif: Math.round(coef_subjectif * 100) / 100,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur /api/evaluer:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
