/**
 * TERRIMO — /tarifs (server component wrapper)
 * Gère metadata + JSON-LD, délègue le rendu interactif à TarifsClient
 */
import { Metadata } from 'next';
import TarifsClient from './TarifsClient';

export const metadata: Metadata = {
  title: 'Tarifs — Vitrine gratuite, Pro 49€, Premium 149€ | Terrimo',
  description: 'Inscrivez votre agence sur Terrimo, la carte immobilière du Bassin d\'Arcachon. Fiche gratuite, plan Pro à 49€/mois avec leads et biens, Premium à 149€/mois.',
  alternates: { canonical: 'https://terrimo.homes/tarifs' },
  openGraph: {
    title: 'Tarifs Terrimo — Visibilité immobilière Bassin d\'Arcachon',
    description: 'Offres Vitrine (gratuit), Pro (49€/mois) et Premium (149€/mois) pour les professionnels de l\'immobilier du Bassin d\'Arcachon.',
    type: 'website',
    locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/tarifs',
  },
  twitter: {
    card: 'summary',
    title: 'Tarifs Terrimo | Bassin d\'Arcachon',
    description: 'Plans Free, Pro 49€, Premium 149€/mois pour les pros de l\'immobilier.',
  },
};

const FAQS_SCHEMA = [
  {
    q: 'Y a-t-il un engagement de durée ?',
    a: 'Non. Les offres Pro et Premium sont mensuelles et résiliables à tout moment, sans frais. Votre fiche reste active en mode Free après résiliation.',
  },
  {
    q: 'Qu\'est-ce que les "profils acquéreurs" ?',
    a: 'Les acquéreurs qui s\'inscrivent sur Terrimo (via les mandats de recherche) sont visibles pour les agences Pro et Premium de leur commune. Vous voyez leur budget, critères et pouvez les contacter en direct.',
  },
  {
    q: 'Comment fonctionne la mise en avant ?',
    a: 'Les fiches Pro apparaissent en premier dans la liste des professionnels de votre commune. Les fiches Premium bénéficient en plus du badge "Recommandé Terrimo" et d\'un placement prioritaire sur la carte.',
  },
  {
    q: 'Quels types de professionnels peuvent s\'inscrire ?',
    a: 'Agences immobilières, notaires, diagnostiqueurs (DPE), conciergeries et services immobiliers.',
  },
  {
    q: 'Comment est calculée la facturation ?',
    a: 'Le paiement est mensuel, prélevé en début de période. La première période démarre le jour de votre inscription. Pas de frais cachés.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // FAQ Rich Snippet
    {
      '@type': 'FAQPage',
      mainEntity: FAQS_SCHEMA.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
    // Breadcrumb
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
        { '@type': 'ListItem', position: 2, name: 'Tarifs', item: 'https://terrimo.homes/tarifs' },
      ],
    },
    // SoftwareApplication pricing (enrichit les snippets)
    {
      '@type': 'WebPage',
      name: 'Tarifs Terrimo',
      url: 'https://terrimo.homes/tarifs',
      description: 'Plans tarifaires pour les professionnels de l\'immobilier du Bassin d\'Arcachon',
      offers: [
        {
          '@type': 'Offer',
          name: 'Vitrine (Free)',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Fiche visible sur la carte Terrimo, coordonnées, lien site web, note Google.',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '49',
          priceCurrency: 'EUR',
          description: 'Leads acquéreurs, publication biens illimitée, mise en avant dans les recherches.',
        },
        {
          '@type': 'Offer',
          name: 'Premium',
          price: '149',
          priceCurrency: 'EUR',
          description: 'Badge Recommandé Terrimo, placement prioritaire carte, leads exclusifs, analytics.',
        },
      ],
    },
  ],
};

export default function TarifsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TarifsClient />
    </>
  );
}
