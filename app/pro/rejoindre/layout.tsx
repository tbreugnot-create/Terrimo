import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rejoindre Terrimo — Agences, Conciergeries, Notaires, Diagnostiqueurs",
  description: "Référencez votre cabinet ou agence sur la plateforme immobilière du Bassin d'Arcachon. Plans Free, Pro 49€, Premium 149€/mois.",
};

export default function ProRejoindreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
