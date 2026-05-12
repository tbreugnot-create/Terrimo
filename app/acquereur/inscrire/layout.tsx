import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Déposer ma recherche immobilière — Trouver un bien | Terrimo",
  description: "Déposez votre profil acquéreur sur le Bassin d'Arcachon. Les agences partenaires vous contactent si un bien correspond à votre recherche.",
};

export default function AcquereurInscrireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
