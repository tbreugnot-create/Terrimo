/**
 * TERRIMO — Liste exhaustive des villages & communes du Bassin d'Arcachon
 * Utilisée dans les formulaires de recherche (mandat acquéreur, leads, filtres)
 * Distincte de lib/communes.ts qui drive les pages /quartier et les stats DVF
 */

export interface Village {
  slug: string;
  name: string;
  communeSlug: string;   // slug de la commune administrative parente
  communeName: string;   // pour l'affichage groupé
  lat?: number;
  lng?: number;
}

export const VILLAGES: Village[] = [

  // ── ARCACHON & quartiers ──────────────────────────────────
  { slug: 'arcachon',        name: 'Arcachon',           communeSlug: 'arcachon',        communeName: 'Arcachon' },
  { slug: 'moulleau',        name: 'Le Moulleau',         communeSlug: 'arcachon',        communeName: 'Arcachon',        lat: 44.6270, lng: -1.1952 },
  { slug: 'pereire',         name: 'Pereire',             communeSlug: 'arcachon',        communeName: 'Arcachon',        lat: 44.6620, lng: -1.1812 },
  { slug: 'ville-hiver',     name: 'Ville d\'Hiver',      communeSlug: 'arcachon',        communeName: 'Arcachon',        lat: 44.6540, lng: -1.1700 },

  // ── LA TESTE-DE-BUCH ──────────────────────────────────────
  { slug: 'la-teste-de-buch', name: 'La Teste-de-Buch',  communeSlug: 'la-teste-de-buch', communeName: 'La Teste-de-Buch' },
  { slug: 'pyla-sur-mer',    name: 'Pyla-sur-Mer',       communeSlug: 'la-teste-de-buch', communeName: 'La Teste-de-Buch', lat: 44.5894, lng: -1.1922 },
  { slug: 'cazaux',          name: 'Cazaux',              communeSlug: 'la-teste-de-buch', communeName: 'La Teste-de-Buch', lat: 44.5358, lng: -1.0889 },

  // ── GUJAN-MESTRAS & 7 ports ───────────────────────────────
  { slug: 'gujan-mestras',   name: 'Gujan-Mestras',      communeSlug: 'gujan-mestras',   communeName: 'Gujan-Mestras' },
  { slug: 'la-hume',         name: 'La Hume',             communeSlug: 'gujan-mestras',   communeName: 'Gujan-Mestras',   lat: 44.6203, lng: -1.0822 },
  { slug: 'larros',          name: 'Larros',              communeSlug: 'gujan-mestras',   communeName: 'Gujan-Mestras',   lat: 44.6322, lng: -1.0614 },
  { slug: 'meyran',          name: 'Meyran',              communeSlug: 'gujan-mestras',   communeName: 'Gujan-Mestras',   lat: 44.6389, lng: -1.0564 },
  { slug: 'le-rocher',       name: 'Le Rocher',           communeSlug: 'gujan-mestras',   communeName: 'Gujan-Mestras',   lat: 44.6408, lng: -1.0514 },

  // ── LE TEICH ──────────────────────────────────────────────
  { slug: 'le-teich',        name: 'Le Teich',            communeSlug: 'le-teich',        communeName: 'Le Teich' },

  // ── BIGANOS ───────────────────────────────────────────────
  { slug: 'biganos',         name: 'Biganos',             communeSlug: 'biganos',         communeName: 'Biganos' },

  // ── AUDENGE ───────────────────────────────────────────────
  { slug: 'audenge',         name: 'Audenge',             communeSlug: 'audenge',         communeName: 'Audenge' },

  // ── LANTON & hameaux ─────────────────────────────────────
  { slug: 'lanton',          name: 'Lanton',              communeSlug: 'lanton',          communeName: 'Lanton' },
  { slug: 'cassy',           name: 'Cassy',               communeSlug: 'lanton',          communeName: 'Lanton',          lat: 44.7194, lng: -1.0303 },
  { slug: 'taussat',         name: 'Taussat',             communeSlug: 'lanton',          communeName: 'Lanton',          lat: 44.7297, lng: -1.0531 },

  // ── ANDERNOS-LES-BAINS ───────────────────────────────────
  { slug: 'andernos-les-bains', name: 'Andernos-les-Bains', communeSlug: 'andernos-les-bains', communeName: 'Andernos-les-Bains' },

  // ── ARÈS ─────────────────────────────────────────────────
  { slug: 'ares',            name: 'Arès',                communeSlug: 'ares',            communeName: 'Arès' },

  // ── MIOS ─────────────────────────────────────────────────
  { slug: 'mios',            name: 'Mios',                communeSlug: 'mios',            communeName: 'Mios' },

  // ── SALLES ───────────────────────────────────────────────
  { slug: 'salles',          name: 'Salles',              communeSlug: 'salles',          communeName: 'Salles' },

  // ── LÈGE-CAP FERRET — 11 villages de la presqu'île ───────
  { slug: 'lege',            name: 'Lège (bourg)',         communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.7253, lng: -1.1625 },
  { slug: 'grand-crohot',    name: 'Grand Crohot',        communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.7628, lng: -1.1950 },
  { slug: 'claouey',         name: 'Claouey',             communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.7169, lng: -1.2094 },
  { slug: 'les-jacquets',    name: 'Les Jacquets',        communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.7058, lng: -1.2153 },
  { slug: 'petit-piquey',    name: 'Petit Piquey',        communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6931, lng: -1.2203 },
  { slug: 'grand-piquey',    name: 'Grand Piquey',        communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6831, lng: -1.2242 },
  { slug: 'piraillan',       name: 'Piraillan',           communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6681, lng: -1.2308 },
  { slug: 'le-canon',        name: 'Le Canon',            communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6581, lng: -1.2392 },
  { slug: 'l-herbe',         name: 'L\'Herbe',            communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6472, lng: -1.2442 },
  { slug: 'la-vigne',        name: 'La Vigne',            communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6408, lng: -1.2489 },
  { slug: 'cap-ferret',      name: 'Cap Ferret (village)', communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6350, lng: -1.2519 },
  { slug: 'le-truc-vert',    name: 'Le Truc Vert',        communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.6719, lng: -1.2394 },
  { slug: 'le-four',         name: 'Le Four',             communeSlug: 'lege-cap-ferret', communeName: 'Lège-Cap Ferret', lat: 44.7008, lng: -1.2197 },
];

/** Groupés par commune pour les selects avec optgroup */
export const VILLAGES_BY_COMMUNE = VILLAGES.reduce<Record<string, Village[]>>((acc, v) => {
  if (!acc[v.communeName]) acc[v.communeName] = [];
  acc[v.communeName].push(v);
  return acc;
}, {});

/** Map slug → village */
export const VILLAGE_BY_SLUG = Object.fromEntries(VILLAGES.map(v => [v.slug, v]));
