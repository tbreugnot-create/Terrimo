/**
 * TERRIMO — Zones micro-locales par commune
 * Coefficients calibrés sur le marché du Bassin d'Arcachon 2024-2025
 */

export interface Zone {
  value: string;
  label: string;
  coef: number;
  description: string;
}

export const ZONES_BY_COMMUNE: Record<string, Zone[]> = {
  'ARCACHON': [
    { value: 'ville-hiver',  label: '🌳 Ville d\'Hiver / Thiers',    coef: 1.25, description: 'Villas Belle Époque, calme absolu, cachet historique exceptionnel' },
    { value: 'moulleau',     label: '🏖️ Le Moulleau',                 coef: 1.18, description: 'Bord de mer, plage prisée, restaurants, animation' },
    { value: 'pereire',      label: '⭐ Pereire / Front de mer',       coef: 1.15, description: 'Hôtels particuliers, première ligne océan' },
    { value: 'centre',       label: '🛍️ Hypercentre',                  coef: 1.05, description: 'Gare, commerces, services — forte demande locative' },
    { value: 'peripherie',   label: '🌲 Périphérie / Cazaux',          coef: 0.90, description: 'Zones résidentielles éloignées du centre' },
  ],
  'LEGE-CAP-FERRET': [
    { value: 'face-ocean',   label: '🌊 Face océan (Grand Crohot…)',  coef: 1.45, description: 'Accès direct océan, dunes — ultra premium' },
    { value: 'cap-village',  label: '⭐ Cap Ferret village',           coef: 1.35, description: 'Le bout de presqu\'île, mythique, très rare' },
    { value: 'herbe-pira',   label: '🦪 L\'Herbe / Piraillan / Canon', coef: 1.28, description: 'Ports ostréicoles face bassin — authenticité absolue' },
    { value: 'face-bassin',  label: '🌊 Face bassin (milieu)',         coef: 1.20, description: 'Vue sur le bassin, plages calmes' },
    { value: 'claouey',      label: '🌲 Claouey / Nord presqu\'île',   coef: 0.90, description: 'Accès plus aisé, prix plus accessibles' },
  ],
  'LA TESTE-DE-BUCH': [
    { value: 'pyla',         label: '⭐ Pyla-sur-Mer / Pylôme',       coef: 1.38, description: 'Villas de prestige, Dune du Pilat à pied — ultra premium' },
    { value: 'bord-dune',    label: '🏖️ Secteur Dune / Forêt',        coef: 1.22, description: 'Proximité dune, calme, forêt de pins' },
    { value: 'centre-teste', label: '🏘️ Centre La Teste',             coef: 1.00, description: 'Centre-ville historique, commerces, services' },
    { value: 'residentiel',  label: '🌲 Résidentiel',                  coef: 0.90, description: 'Quartiers pavillonnaires classiques' },
  ],
  'ANDERNOS-LES-BAINS': [
    { value: 'bord-bassin',  label: '🌊 Bord bassin / Jetée',         coef: 1.22, description: 'La célèbre jetée, front de bassin, très recherché' },
    { value: 'centre',       label: '🛍️ Hypercentre',                  coef: 1.06, description: 'Marché, commerces, animation, plage eau douce' },
    { value: 'residentiel',  label: '🏘️ Résidentiel',                  coef: 1.00, description: 'Quartiers pavillonnaires calmes' },
    { value: 'peripherie',   label: '🌲 Périphérie',                   coef: 0.88, description: 'Zones en entrée de ville, moins recherchées' },
  ],
  'ARES': [
    { value: 'port-bassin',  label: '🦪 Port / Bord bassin',          coef: 1.22, description: 'Port ostréicole, front de bassin, très authentique' },
    { value: 'centre',       label: '⛪ Centre / Place de l\'Église',  coef: 1.06, description: 'Commerces, vie de village animée' },
    { value: 'residentiel',  label: '🏘️ Résidentiel',                  coef: 1.00, description: 'Quartiers pavillonnaires calmes' },
    { value: 'peripherie',   label: '🌲 Périphérie',                   coef: 0.87, description: 'Entrée de ville, moins recherché' },
  ],
  'GUJAN-MESTRAS': [
    { value: 'ports',        label: '🦪 Ports ostréicoles',           coef: 1.18, description: 'Les 7 ports, front de bassin, typique Bassin' },
    { value: 'bord-bassin',  label: '🌊 Bord bassin',                 coef: 1.10, description: 'Accès eau, vue bassin' },
    { value: 'centre',       label: '🏘️ La Hume / Centre',            coef: 1.00, description: 'Centre-ville, gare, commerces' },
    { value: 'residentiel',  label: '🌲 Résidentiel intérieur',        coef: 0.93, description: 'Quartiers pavillonnaires sans accès direct bassin' },
  ],
  'LANTON': [
    { value: 'taussat',      label: '🌊 Taussat / Bord bassin',       coef: 1.18, description: 'Plage très prisée des locaux, calme' },
    { value: 'cassy',        label: '🦪 Cassy (port)',                 coef: 1.10, description: 'Petit port typique, ambiance ostréicole' },
    { value: 'residentiel',  label: '🏘️ Lanton bourg / Résidentiel',  coef: 1.00, description: 'Bourg principal, bien desservi' },
  ],
  'BIGANOS': [
    { value: 'bords',        label: '🌊 Quartiers proches bassin',    coef: 1.08, description: 'Proximité bassin, nature' },
    { value: 'residentiel',  label: '🏘️ Résidentiel',                  coef: 1.00, description: 'Quartiers pavillonnaires' },
    { value: 'peripherie',   label: '🌲 Périphérie / ZA',              coef: 0.90, description: 'Zones périphériques moins recherchées' },
  ],
  'AUDENGE': [
    { value: 'bord-bassin',  label: '🌊 Bord bassin',                 coef: 1.12, description: 'Accès eau, vue Île aux Oiseaux' },
    { value: 'residentiel',  label: '🏘️ Résidentiel',                  coef: 1.00, description: 'Quartiers pavillonnaires calmes' },
    { value: 'peripherie',   label: '🌲 Périphérie',                   coef: 0.90, description: 'Zones éloignées' },
  ],
  'LE TEICH': [
    { value: 'bord-bassin',  label: '🌿 Bord bassin / Réserve',       coef: 1.12, description: 'Réserve ornithologique, nature unique' },
    { value: 'residentiel',  label: '🏘️ Résidentiel',                  coef: 1.00, description: 'Quartiers pavillonnaires, gare SNCF' },
    { value: 'peripherie',   label: '🌲 Périphérie',                   coef: 0.90, description: 'Zones moins centrales' },
  ],
};
