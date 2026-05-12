import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contactez Terrimo — Bassin d'Arcachon",
  description: "Une question sur Terrimo, les tarifs ou un partenariat ? Contactez notre équipe. Réponse sous 24h.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
