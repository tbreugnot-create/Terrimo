import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mettre en location sur le Bassin d\'Arcachon — Location saisonnière & annuelle | Terrimo',
  description: 'Vous souhaitez louer votre bien sur le Bassin d\'Arcachon ? Trouvez la meilleure conciergerie ou agence de gestion locative. Location saisonnière, annuelle, ou mixte. Mise en relation gratuite.',
  alternates: { canonical: 'https://terrimo.homes/louer' },
  openGraph: {
    title: 'Mettre en location sur le Bassin d\'Arcachon — Terrimo',
    description: 'Conciergeries et agences vérifiées pour louer votre bien. Location saisonnière ou annuelle, réponse sous 24h.',
    type: 'website',
    locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/louer',
  },
  twitter: {
    card: 'summary',
    title: 'Mettre en location Bassin d\'Arcachon | Terrimo',
    description: 'Conciergeries vérifiées, location saisonnière ou annuelle, sans engagement.',
  },
};

export default function LouerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
