-- ============================================================
-- SEED : Agences initiales du Bassin d'Arcachon
-- ============================================================

INSERT INTO agencies (name, slug, commune, type, plan, google_rating, google_reviews, lat, lng, is_recommended, website) VALUES
-- PREMIUM / Recommandées
('Barnes Arcachon',         'barnes-arcachon',          'Arcachon',              'franchise',    'premium', 4.8, 32, 44.6583, -1.1686, true,  'https://www.barnes-international.com'),
('Barnes Cap Ferret',       'barnes-cap-ferret',         'Lège-Cap-Ferret',       'franchise',    'premium', 4.8, 35, 44.6342, -1.2489, true,  'https://www.barnes-international.com'),
('Immobilier Prestige Pyla','immobilier-prestige-pyla',  'La Teste-de-Buch',      'independant',  'premium', 4.9, 22, 44.5942, -1.2097, true,  null),
('Agence du Cap Ferret',    'agence-cap-ferret',         'Lège-Cap-Ferret',       'independant',  'premium', 4.7, 19, 44.6308, -1.2503, true,  null),
-- PRO
('Century 21 Arcachon',     'century21-arcachon',        'Arcachon',              'franchise',    'pro',     4.3, 25, 44.6522, -1.1675, false, null),
('Laforêt Arcachon',        'laforet-arcachon',          'Arcachon',              'franchise',    'pro',     4.5, 28, 44.6490, -1.1650, false, null),
('Laforêt Audenge',         'laforet-audenge',           'Audenge',               'franchise',    'pro',     4.4, 10, 44.6833, -1.0167, false, null),
('Coldwell Banker Cap Ferret','coldwell-cap-ferret',     'Lège-Cap-Ferret',       'franchise',    'pro',     4.5, 14, 44.6350, -1.2450, false, null),
('Stéphane Plaza Gujan',    'stephane-plaza-gujan',      'Gujan-Mestras',         'franchise',    'pro',     4.7, 24, 44.6358, -1.0697, false, null),
('Nestenn Andernos',        'nestenn-andernos',          'Andernos-les-Bains',    'franchise',    'pro',     4.6, 21, 44.7467, -1.0975, false, null),
('Guy Hoquet La Teste',     'guy-hoquet-la-teste',       'La Teste-de-Buch',      'franchise',    'pro',     4.2, 20, 44.6272, -1.1333, false, null),
('Cabinet Martin Immo',     'cabinet-martin',            'Gujan-Mestras',         'independant',  'pro',     4.5, 9,  44.6380, -1.0720, false, null),
-- FREE
('Immobilière du Bassin',   'immobiliere-bassin',        'Arcachon',              'independant',  'free',    4.6, 18, 44.6540, -1.1670, false, null),
('Orpi Agence du Pyla',     'orpi-pyla',                 'La Teste-de-Buch',      'franchise',    'free',    4.4, 15, 44.5880, -1.2150, false, null),
('Square Habitat Arès',     'square-habitat-ares',       'Arès',                  'franchise',    'free',    4.2, 14, 44.7650, -1.1358, false, null),
('L''Adresse Gujan',        'ladresse-gujan',            'Gujan-Mestras',         'franchise',    'free',    4.1, 17, 44.6370, -1.0680, false, null),
('Maxwell-Baynes Christie''s','maxwell-baynes',          'La Teste-de-Buch',      'independant',  'free',    null,0,  44.5920, -1.2050, false, null),
('Michaël Zingraf',         'michael-zingraf',           'La Teste-de-Buch',      'independant',  'free',    null,0,  44.5950, -1.2100, false, null),
('IAD France Andernos',     'iad-andernos',              'Andernos-les-Bains',    'franchise',    'free',    4.0, 8,  44.7450, -1.0990, false, null),
('Immo de France Le Teich', 'immo-france-le-teich',     'Le Teich',              'franchise',    'free',    4.3, 8,  44.6369, -1.0244, false, null)
ON CONFLICT (slug) DO NOTHING;
