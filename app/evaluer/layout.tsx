import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimation gratuite immobilier Bassin d\'Arcachon — Données DVF | Terrimo',
  description:
    'Estimez votre bien immobilier sur le Bassin d\'Arcachon en 2 minutes. Algorithme basé sur les données DVF officielles (transactions notariées réelles). Fourchette de prix précise, sans engagement.',
  alternates: { canonical: 'https://terrimo.homes/evaluer' },
  openGraph: {
    title: 'Estimation gratuite Bassin d\'Arcachon — Données DVF',
    description: 'Fourchette de prix en 2 minutes basée sur les transactions réelles DVF. Arcachon, Cap Ferret, La Teste, Andernos.',
    type: 'website',
    locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/evaluer',
  },
  twitter: {
    card: 'summary',
    title: 'Estimation immobilier Bassin d\'Arcachon | Terrimo',
    description: 'Fourchette DVF précise en 2 minutes. Sans engagement.',
  },
};

export default function EvaluerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
