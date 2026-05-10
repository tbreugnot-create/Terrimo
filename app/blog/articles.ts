export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  emoji: string;
  color: string;
  content: string; // HTML string
  keywords: string[];
}

export const ARTICLES: Article[] = [
  // ── 1. Prix immobilier Arcachon 2025 ─────────────────────
  {
    slug: 'prix-immobilier-arcachon-2025',
    title: "Prix immobilier Bassin d'Arcachon 2025 : toutes les données DVF",
    excerpt: "Analyse complète des prix au m² par commune, évolution 2022–2025 et prévisions. Arcachon, Cap Ferret, La Teste, Andernos : qui monte, qui consolide ?",
    category: 'Marché',
    date: '10 mai 2025',
    readTime: '8 min',
    emoji: '📊',
    color: 'linear-gradient(135deg, #1e3a5f, #0c2240)',
    keywords: ['prix immobilier arcachon 2025', 'dvf bassin arcachon', 'prix m2 arcachon'],
    content: `
<h2>Le Bassin d'Arcachon en 2025 : un marché de luxe résilient</h2>
<p>Le marché immobilier du Bassin d'Arcachon a démontré une résilience remarquable face à la hausse des taux d'intérêt de 2022–2024. Porté par une demande structurellement forte (résidences secondaires, retraités aisés, télétravailleurs), les prix restent parmi les plus élevés du littoral atlantique.</p>

<h2>Prix médians par commune (données DVF 2024)</h2>
<p>Selon les Demandes de Valeurs Foncières officielles, voici les prix médians observés sur les transactions récentes :</p>

<table>
<thead><tr><th>Commune</th><th>Maison (€/m²)</th><th>Appartement (€/m²)</th><th>Évolution 2023→2024</th></tr></thead>
<tbody>
<tr><td><strong>Arcachon</strong></td><td>7 200–9 500</td><td>5 800–7 200</td><td>+3,2 %</td></tr>
<tr><td><strong>Lège-Cap-Ferret</strong></td><td>8 500–14 000</td><td>—</td><td>+5,1 %</td></tr>
<tr><td><strong>La Teste-de-Buch</strong></td><td>4 200–6 800</td><td>3 500–5 200</td><td>−1,8 %</td></tr>
<tr><td><strong>Andernos-les-Bains</strong></td><td>3 800–5 500</td><td>3 200–4 800</td><td>+1,2 %</td></tr>
<tr><td><strong>Gujan-Mestras</strong></td><td>3 500–5 200</td><td>2 800–4 500</td><td>−0,5 %</td></tr>
</tbody>
</table>

<h2>Cap Ferret : marché à part entière</h2>
<p>Le Cap Ferret constitue le marché le plus exclusif du Bassin. La rareté des biens disponibles (foncier bloqué par la Zone de Protection Spéciale et le Conservatoire du Littoral) maintient une pression haussière structurelle. Les villas avec accès direct à la plage ou au Bassin franchissent régulièrement les 15 000 €/m².</p>

<h2>Les facteurs qui soutiennent les prix</h2>
<p><strong>Rareté du foncier :</strong> La grande majorité du littoral est inconstructible (Zone Natura 2000, Conservatoire du Littoral, forêt domaniale). Les terrains libres sont rarissimes.</p>
<p><strong>Demande nationale :</strong> Le Bassin attire des acheteurs de toute la France, notamment des cadres parisiens et bordelais en quête de résidences secondaires ou de télétravail.</p>
<p><strong>Tourisme premium :</strong> Avec 3 millions de visiteurs par an, la rentabilité locative saisonnière reste attrayante malgré le durcissement de la réglementation.</p>

<h2>Perspectives 2025</h2>
<p>La baisse progressive des taux directeurs de la BCE depuis mi-2024 redonne du pouvoir d'achat aux acquéreurs financés par crédit. Les projections indiquent une stabilisation des prix à Arcachon et La Teste, avec une légère hausse (+2 à 3 %) sur les communes plus accessibles comme Andernos et Gujan.</p>
    `,
  },

  // ── 2. Guide achat immobilier Bassin ─────────────────────
  {
    slug: 'guide-achat-immobilier-bassin-arcachon',
    title: "Guide complet : acheter un bien sur le Bassin d'Arcachon",
    excerpt: "Tout ce que vous devez savoir avant d'acheter : zonage, règles locales, pièges à éviter, DPE obligatoire, charges de copropriété. Le guide des experts Terrimo.",
    category: 'Guide achat',
    date: '5 mai 2025',
    readTime: '12 min',
    emoji: '🏡',
    color: 'linear-gradient(135deg, #0a4a2e, #0f3d1a)',
    keywords: ['acheter bassin arcachon', 'guide achat immobilier arcachon', 'investissement arcachon'],
    content: `
<h2>Pourquoi acheter sur le Bassin d'Arcachon ?</h2>
<p>Le Bassin d'Arcachon offre une qualité de vie exceptionnelle : 65 km de côtes, une gastronomie reconnue (huîtres, pibales), un ensoleillement supérieur à la moyenne nationale et une desserte ferroviaire directe depuis Bordeaux (50 min). Ces atouts en font l'une des destinations immobilières les plus prisées de France.</p>

<h2>Les 5 étapes clés de votre achat</h2>
<p><strong>1. Définir votre projet :</strong> Résidence principale, secondaire ou investissement locatif ? Chaque statut implique des règles fiscales et des contraintes réglementaires différentes (notamment sur la location saisonnière).</p>
<p><strong>2. Obtenir votre accord bancaire :</strong> Le marché est compétitif. Présenter un accord de principe auprès des agences augmente significativement vos chances d'obtenir une visite prioritaire sur les biens recherchés.</p>
<p><strong>3. Analyser le DPE :</strong> Depuis 2025, les biens classés F ou G sont interdits à la location. Anticipez le coût de rénovation énergétique dans votre budget.</p>
<p><strong>4. Vérifier la constructibilité :</strong> Le PLU (Plan Local d'Urbanisme) peut limiter les extensions, surélévations ou piscines. Consultez la mairie avant de signer.</p>
<p><strong>5. Négocier avec les données DVF :</strong> Utilisez les données Terrimo pour connaître le prix réel des transactions comparables. Un écart de 10 à 20 % par rapport à la médiane DVF est une base solide de négociation.</p>

<h2>Les pièges à éviter</h2>
<p><strong>La zone de submersion :</strong> Certains secteurs de basse altitude (Andernos, Biganos, Le Teich) sont soumis au Plan de Prévention des Risques d'Inondation (PPRI). Vérifiez toujours le statut du bien sur Géorisques.</p>
<p><strong>Les maisons en bois :</strong> Typiques du Bassin, elles nécessitent un entretien régulier (traitement bois, toiture, isolation). Faites réaliser un diagnostic complet par un expert agréé.</p>
<p><strong>La copropriété saisonnière :</strong> Certaines résidences de tourisme ont des règlements de copropriété restrictifs sur la durée de location. Lisez attentivement le règlement avant signature.</p>
    `,
  },

  // ── 3. Location saisonnière fiscalité ─────────────────────
  {
    slug: 'fiscalite-location-saisonniere-bassin-arcachon',
    title: "Location saisonnière sur le Bassin : fiscalité & réglementation 2025",
    excerpt: "LMNP, numéro d'enregistrement, taxe de séjour, plafond 120 jours... Tout ce qu'il faut savoir pour louer légalement et optimiser sa fiscalité.",
    category: 'Fiscalité',
    date: '28 avril 2025',
    readTime: '10 min',
    emoji: '🌊',
    color: 'linear-gradient(135deg, #0c2a4a, #0a3a6a)',
    keywords: ['location saisonniere arcachon fiscalite', 'lmnp bassin arcachon', 'airbnb arcachon réglementation'],
    content: `
<h2>Le cadre légal de la location saisonnière en 2025</h2>
<p>La loi « Le Meur » adoptée fin 2024 a profondément remanié les règles applicables aux meublés de tourisme. Le Bassin d'Arcachon, classé en zone tendue, est particulièrement concerné.</p>

<h2>Enregistrement obligatoire</h2>
<p>Depuis le 1er janvier 2025, tout propriétaire souhaitant louer son bien en meublé de tourisme doit obtenir un numéro d'enregistrement auprès de sa mairie. Cette démarche est gratuite et obligatoire avant toute publication sur les plateformes (Airbnb, Booking, Abritel).</p>

<h2>Le plafond des 90 jours</h2>
<p>Pour les résidences principales, la durée maximale de location est désormais fixée à 90 jours par an dans les communes en zone tendue (contre 120 jours auparavant). Arcachon, La Teste-de-Buch et Andernos sont concernées.</p>

<h2>Fiscalité : LMNP ou régime micro-BIC ?</h2>
<p><strong>Micro-BIC :</strong> Abattement forfaitaire de 50 % sur les recettes (30 % pour les meublés de tourisme non classés depuis 2025). Adapté si vos recettes annuelles sont inférieures à 77 700 €.</p>
<p><strong>LMNP au réel :</strong> Déduction des charges réelles (intérêts d'emprunt, amortissement du bien, charges de copropriété, frais de gestion). Généralement plus avantageux au-delà de 30 000 € de recettes annuelles.</p>

<h2>La taxe de séjour</h2>
<p>Chaque commune du Bassin perçoit une taxe de séjour sur les nuitées. En 2025, les taux varient de 1,50 à 4,20 € par nuit et par personne selon la catégorie du logement. Les plateformes collectent et reversent automatiquement cette taxe.</p>

<h2>Conseil pratique</h2>
<p>Faites-vous accompagner par un expert-comptable spécialisé en immobilier dès la première année. L'optimisation fiscale peut représenter plusieurs milliers d'euros d'économies annuelles selon votre situation.</p>
    `,
  },

  // ── 4. Meilleurs quartiers Arcachon ───────────────────────
  {
    slug: 'meilleurs-quartiers-arcachon',
    title: "Arcachon : quel quartier choisir pour acheter en 2025 ?",
    excerpt: "Ville d'Hiver, Ville d'Été, Abatilles, Pereire... Chaque quartier a son caractère et ses prix. Notre analyse complète pour trouver le secteur qui vous correspond.",
    category: 'Quartiers',
    date: '20 avril 2025',
    readTime: '7 min',
    emoji: '🗺️',
    color: 'linear-gradient(135deg, #1a1a3e, #2d1f5e)',
    keywords: ['quartier arcachon immobilier', 'ville hiver arcachon prix', 'abatilles arcachon acheter'],
    content: `
<h2>Les 4 villes d'Arcachon</h2>
<p>Arcachon est historiquement divisée en 4 "Villes" selon les saisons. Chacune a une identité architecturale forte et des prix distincts.</p>

<h2>La Ville d'Hiver : prestige et patrimoine</h2>
<p>Nichée dans les pins à 30 mètres d'altitude, la Ville d'Hiver est le quartier le plus emblématique d'Arcachon. Ses villas Belle Époque aux décors de bois sculpté sont classées au patrimoine architectural. C'est le secteur le plus cher de la ville.</p>
<p><strong>Prix observés :</strong> 8 000 à 12 000 €/m² pour une villa avec jardin. Les biens au-dessus de 2 M€ sont courants.</p>

<h2>La Ville d'Été : animations et front de mer</h2>
<p>En bord de Bassin, la Ville d'Été concentre la vie commerçante (casino, restaurants, plages). Elle séduit les amateurs de vie animée et les investisseurs en location saisonnière.</p>
<p><strong>Prix observés :</strong> 6 000 à 9 000 €/m² selon la proximité de la plage.</p>

<h2>Les Abatilles : résidentiel tranquille</h2>
<p>Quartier résidentiel calme au sud de la commune, les Abatilles offrent de belles maisons à des prix plus accessibles. Idéal pour les familles cherchant tranquillité et espace.</p>
<p><strong>Prix observés :</strong> 4 500 à 7 000 €/m².</p>

<h2>Le Moulleau : ambiance village</h2>
<p>À la limite avec La Teste-de-Buch, le Moulleau a conservé son authenticité avec ses artisans et son marché. Prisé pour son caractère préservé, à des prix légèrement inférieurs au centre.</p>
<p><strong>Prix observés :</strong> 5 000 à 8 000 €/m².</p>

<h2>Notre recommandation</h2>
<p>Si votre budget est entre 400 000 et 700 000 €, orientez-vous vers les Abatilles ou le Moulleau pour un meilleur rapport qualité/surface. Pour une résidence secondaire avec fort potentiel locatif, la Ville d'Été reste la valeur sûre.</p>
    `,
  },

  // ── 5. DPE et rénovation ──────────────────────────────────
  {
    slug: 'dpe-renovation-energetique-immobilier-arcachon',
    title: "DPE et rénovation énergétique : ce qui change pour les propriétaires du Bassin",
    excerpt: "Interdiction progressive des passoires thermiques, aide MaPrimeRénov, diagnostic obligatoire avant vente. Le guide complet pour les propriétaires du Bassin d'Arcachon.",
    category: 'Réglementation',
    date: '12 avril 2025',
    readTime: '9 min',
    emoji: '🔬',
    color: 'linear-gradient(135deg, #1a3a0a, #2a5010)',
    keywords: ['dpe arcachon', 'rénovation énergétique bassin arcachon', 'passoire thermique location'],
    content: `
<h2>Le calendrier de l'interdiction</h2>
<p>La loi Climat & Résilience impose un calendrier progressif de sortie des passoires thermiques du parc locatif :</p>
<ul>
<li><strong>Depuis 2025 :</strong> Les logements classés G (consommation > 450 kWh/m²/an) sont interdits à la location</li>
<li><strong>2028 :</strong> Interdiction étendue aux logements classés F</li>
<li><strong>2034 :</strong> Interdiction des logements classés E</li>
</ul>

<h2>L'enjeu spécifique du Bassin d'Arcachon</h2>
<p>Le parc immobilier du Bassin est particulièrement touché. Les maisons en bois traditionnelles (cabanes ostréicoles, villas Belle Époque) présentent souvent une isolation insuffisante et des systèmes de chauffage vieillissants. On estime que 18 % des logements du Bassin sont classés E, F ou G.</p>

<h2>Les aides disponibles</h2>
<p><strong>MaPrimeRénov' :</strong> Jusqu'à 70 % des coûts de rénovation pris en charge pour les ménages modestes. Montant plafonné à 70 000 € par logement.</p>
<p><strong>Éco-PTZ :</strong> Prêt à taux zéro jusqu'à 50 000 € pour les rénovations globales (isolation, ventilation, chauffage).</p>
<p><strong>TVA à 5,5 % :</strong> Applicable aux travaux d'amélioration énergétique réalisés par des artisans RGE (Reconnu Garant de l'Environnement).</p>

<h2>Impact sur la valeur vénale</h2>
<p>Les études récentes montrent une décote de 5 à 15 % sur les biens classés F-G par rapport à des biens équivalents classés C-D. Dans un marché premium comme le Bassin, où chaque m² compte, anticiper la rénovation énergétique est un investissement rentable.</p>

<h2>Que faire si votre bien est mal classé ?</h2>
<p>1. Faites réaliser un DPE opposable par un diagnostiqueur certifié (environ 150 à 300 €). 2. Obtenez un audit énergétique (obligatoire pour les biens F-G depuis 2023). 3. Consultez votre agence immobilière pour une estimation avant/après travaux.</p>
    `,
  },

  // ── 6. Investir à Arcachon ────────────────────────────────
  {
    slug: 'investir-immobilier-bassin-arcachon-2025',
    title: "Investir dans l'immobilier sur le Bassin d'Arcachon : rentabilité, risques et opportunités",
    excerpt: "Rendement locatif brut, zones tendues, encadrement des loyers, fiscalité LMNP... Faut-il encore investir sur le Bassin en 2025 ? Notre analyse chiffrée.",
    category: 'Investissement',
    date: '3 avril 2025',
    readTime: '11 min',
    emoji: '📈',
    color: 'linear-gradient(135deg, #2a1a0a, #4a2e10)',
    keywords: ['investir arcachon 2025', 'rendement locatif arcachon', 'investissement immobilier bassin arcachon'],
    content: `
<h2>Le contexte de 2025 : fenêtre d'opportunité ?</h2>
<p>La remontée des taux d'intérêt de 2022 à 2024 a refroidi le marché des investisseurs particuliers, réduisant la concurrence à l'achat. Avec la baisse progressive des taux BCE depuis mi-2024, 2025 pourrait représenter une fenêtre d'entrée intéressante, avant le retour des investisseurs institutionnels.</p>

<h2>Rentabilité brute par type de bien</h2>
<table>
<thead><tr><th>Type de bien</th><th>Prix d'achat moyen</th><th>Revenu annuel brut</th><th>Rendement brut</th></tr></thead>
<tbody>
<tr><td>Appartement T2 (location annuelle)</td><td>280 000 €</td><td>9 600 €</td><td>3,4 %</td></tr>
<tr><td>Maison 4p (location saisonnière)</td><td>580 000 €</td><td>45 000 €</td><td>7,8 %</td></tr>
<tr><td>Studio (location étudiants/saisonniers)</td><td>165 000 €</td><td>8 400 €</td><td>5,1 %</td></tr>
<tr><td>Villa Cap Ferret (saisonnier premium)</td><td>2 500 000 €</td><td>120 000 €</td><td>4,8 %</td></tr>
</tbody>
</table>

<h2>La location saisonnière : le levier de performance</h2>
<p>Le rendement brut de la location saisonnière sur le Bassin est structurellement supérieur à la location longue durée. Un T3 bien situé à Arcachon peut générer 40 000 à 60 000 € de recettes annuelles sur 16 semaines d'occupation haute saison. Mais ce modèle est soumis à contraintes croissantes (réglementation, DPE, encadrement).</p>

<h2>Les zones d'opportunité</h2>
<p><strong>Gujan-Mestras et Le Teich :</strong> Prix 30 à 40 % inférieurs à Arcachon pour des biens à 15 min du centre. Rendements locatifs annuels plus attractifs (4 à 5 % brut).</p>
<p><strong>Andernos-les-Bains :</strong> En cours de valorisation avec les nouveaux aménagements de la promenade. Les prix suivront.</p>

<h2>Les risques à anticiper</h2>
<p>1. Durcissement réglementaire sur la location saisonnière (quotas, enregistrement, DPE). 2. Risque de submersion marine dans les zones basses. 3. Coûts d'entretien élevés (maisons en bois, humidité, sel). 4. Fiscalité alourdissant la détention longue durée.</p>

<h2>Notre verdict</h2>
<p>Investir sur le Bassin d'Arcachon reste pertinent à horizon 10+ ans, à condition de sélectionner des biens à bon DPE, en dehors des zones inondables, et avec un potentiel saisonnier démontré. L'accompagnement par une agence locale spécialisée est indispensable pour éviter les pièges.</p>
    `,
  },
];
