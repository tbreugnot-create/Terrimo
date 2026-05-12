import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendre ou louer sur le Bassin d\'Arcachon — Estimation gratuite | Terrimo',
  description: 'Déposez votre projet immobilier sur le Bassin d\'Arcachon. Mise en relation avec les meilleures agences locales, estimation basée sur les données DVF réelles, réponse sous 24h.',
  alternates: { canonical: 'https://terrimo.homes/vendre' },
  openGraph: {
    title: 'Vendre mon bien sur le Bassin d\'Arcachon — Terrimo',
    description: 'Trouvez l\'agence idéale pour vendre ou louer votre bien. Estimation DVF gratuite, sans engagement.',
    type: 'website',
    locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/vendre',
  },
  twitter: {
    card: 'summary',
    title: 'Vendre sur le Bassin d\'Arcachon | Terrimo',
    description: 'Agences vérifiées, estimation DVF, réponse sous 24h.',
  },
};

export default function VendreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
