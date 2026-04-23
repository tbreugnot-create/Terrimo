export type CommuneTier = 'premium' | 'equilibre' | 'emergent';

export interface Commune {
  slug: string;
  name: string;
  dvfName: string;
  tier: CommuneTier;
  tierLabel: string;
  tierEmoji: string;
  tagline: string;
  description: string;
  lat: number;
  lng: number;
}

export const COMMUNES: Commune[] = [
  {
    slug: 'arcachon',
    name: 'Arcachon',
    dvfName: 'ARCACHON',
    tier: 'premium',
    tierLabel: 'Premium',
    tierEmoji: '💎',
    tagline: 'Ville d\'Hiver, Pereire, Moulleau — Patrimoine & tourisme toute l\'année',
    description: `Arcachon est la perle du Bassin, célèbre pour sa Ville d'Hiver aux villas du XIXe siècle, ses plages de sable fin et son front de mer animé. Station balnéaire historique, elle attire aussi bien les résidents permanents que les investisseurs en quête de prestige. Le marché immobilier y reste soutenu toute l'année grâce au tourisme, à la desserte TGV et à un cadre de vie exceptionnel entre océan et forêt de pins.`,
    lat: 44.6522,
    lng: -1.1675,
  },
  {
    slug: 'la-teste-de-buch',
    name: 'La Teste-de-Buch',
    dvfName: 'LA TESTE-DE-BUCH',
    tier: 'premium',
    tierLabel: 'Premium',
    tierEmoji: '💎',
    tagline: 'Pyla-sur-Mer, Dune du Pilat — Ultra premium, villas vue bassin',
    description: `La Teste-de-Buch abrite Pyla-sur-Mer et la célèbre Dune du Pilat, site naturel le plus visité de France. Son marché immobilier est parmi les plus exclusifs du littoral atlantique, porté par une offre rare de villas avec vue sur le bassin et la forêt. La proximité immédiate d'Arcachon et l'accès à la Dune font de ce secteur un investissement patrimonial de premier rang.`,
    lat: 44.6272,
    lng: -1.1333,
  },
  {
    slug: 'lege-cap-ferret',
    name: 'Lège-Cap-Ferret',
    dvfName: 'LEGE-CAP-FERRET',
    tier: 'premium',
    tierLabel: 'Premium',
    tierEmoji: '💎',
    tagline: 'Le Saint-Tropez de l\'Atlantique — Prestige absolu',
    description: `Le Cap Ferret est l'adresse la plus convoitée du Bassin. Cette presqu'île sauvage entre bassin et océan attire l'élite parisienne depuis des décennies. Le marché y est extrêmement tendu, avec des cabanes ostréicoles reconverties et des villas de luxe qui s'arrachent à des prix record. L'authenticité préservée et l'absence de commercialisation à outrance en font un lieu à part entière.`,
    lat: 44.6308,
    lng: -1.2503,
  },
  {
    slug: 'andernos-les-bains',
    name: 'Andernos-les-Bains',
    dvfName: 'ANDERNOS-LES-BAINS',
    tier: 'equilibre',
    tierLabel: 'Équilibré',
    tierEmoji: '⚖️',
    tagline: 'Côte nord — Meilleur compromis prix/rentabilité',
    description: `Andernos-les-Bains séduit par sa plage en eau douce, son jetée mythique et son ambiance familiale. Commune la plus peuplée de la côte nord du Bassin, elle offre un excellent compromis entre qualité de vie et accessibilité des prix. Le marché y est stable et attractif pour les primo-accédants et les investisseurs recherchant de la rentabilité locative saisonnière.`,
    lat: 44.7467,
    lng: -1.0975,
  },
  {
    slug: 'ares',
    name: 'Arès',
    dvfName: 'ARES',
    tier: 'equilibre',
    tierLabel: 'Équilibré',
    tierEmoji: '⚖️',
    tagline: 'Authentique bassin — En forte montée',
    description: `Arès, à l'entrée nord du Bassin d'Arcachon, séduit par son authenticité et son cadre naturel préservé. Entre forêt de pins, prés salés et plages tranquilles, cette commune familiale offre une qualité de vie remarquable à un coût plus accessible que ses voisines. Le port ostréicole et les sentiers du littoral en font un lieu de vie prisé des amoureux de nature.`,
    lat: 44.7650,
    lng: -1.1358,
  },
  {
    slug: 'gujan-mestras',
    name: 'Gujan-Mestras',
    dvfName: 'GUJAN-MESTRAS',
    tier: 'equilibre',
    tierLabel: 'Équilibré',
    tierEmoji: '⚖️',
    tagline: 'Capitale ostréicole — Résidentiel accessible',
    description: `Gujan-Mestras est la capitale ostréicole du Bassin, avec ses 7 ports pittoresques. Ville la plus peuplée du Bassin après Arcachon, elle offre un marché résidentiel accessible avec une forte demande permanente. Sa position centrale sur le bassin, son dynamisme commercial et sa connexion ferroviaire en font une commune en pleine expansion.`,
    lat: 44.6358,
    lng: -1.0697,
  },
  {
    slug: 'lanton',
    name: 'Lanton',
    dvfName: 'LANTON',
    tier: 'emergent',
    tierLabel: 'Émergent',
    tierEmoji: '📈',
    tagline: 'Nature & tranquillité — Potentiel de valorisation',
    description: `Lanton est une commune en plein essor, prisée pour son cadre naturel exceptionnel entre lac, forêt et bassin. Moins connue que ses voisines, elle offre des opportunités d'investissement à des prix encore attractifs avec un potentiel de valorisation important. Sa plage de Taussat est l'une des plus appréciées du Bassin par les locaux.`,
    lat: 44.7108,
    lng: -1.0444,
  },
  {
    slug: 'biganos',
    name: 'Biganos',
    dvfName: 'BIGANOS',
    tier: 'emergent',
    tierLabel: 'Émergent',
    tierEmoji: '📈',
    tagline: 'Porte du Bassin — Prix accessibles, forte croissance',
    description: `Biganos constitue la porte d'entrée du Bassin depuis Bordeaux. Cette commune résidentielle bénéficie d'une connexion ferroviaire directe avec Bordeaux et d'un marché immobilier parmi les plus accessibles du secteur. L'afflux de nouveaux résidents fuyant les prix bordelais en fait l'un des marchés les plus dynamiques en volume de transactions.`,
    lat: 44.6675,
    lng: -0.9753,
  },
  {
    slug: 'audenge',
    name: 'Audenge',
    dvfName: 'AUDENGE',
    tier: 'emergent',
    tierLabel: 'Émergent',
    tierEmoji: '📈',
    tagline: 'Entre lac et bassin — Marché en développement',
    description: `Audenge bénéficie d'une situation géographique privilégiée entre le lac de Cazaux et le Bassin d'Arcachon. Cette commune tranquille attire de nouveaux habitants en quête d'espace et de nature à des prix encore raisonnables. La réserve naturelle de l'Île aux Oiseaux visible depuis ses rives et le développement de ses équipements en font une commune à fort potentiel.`,
    lat: 44.6833,
    lng: -1.0167,
  },
  {
    slug: 'le-teich',
    name: 'Le Teich',
    dvfName: 'LE TEICH',
    tier: 'emergent',
    tierLabel: 'Émergent',
    tierEmoji: '📈',
    tagline: 'Réserve ornithologique — Cadre naturel unique',
    description: `Le Teich abrite la célèbre Réserve Ornithologique, l'une des plus importantes de France. Cette commune à la croisée du delta de la Leyre et du Bassin offre un cadre naturel unique et des prix immobiliers encore très accessibles. Sa gare SNCF et la proximité de Gujan-Mestras en font une base résidentielle idéale pour les actifs du bassin.`,
    lat: 44.6369,
    lng: -1.0244,
  },
];

export const COMMUNE_BY_SLUG = Object.fromEntries(
  COMMUNES.map(c => [c.slug, c])
);

export const COMMUNE_BY_DVF = Object.fromEntries(
  COMMUNES.map(c => [c.dvfName, c])
);
