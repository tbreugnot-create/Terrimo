import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terrimo — Immobilier Bassin d'Arcachon | Carte interactive",
  description: "Explorez les communes du Bassin d'Arcachon sur une carte interactive. Découvrez les agences, transactions DVF et prix au m². D'Arcachon au Cap Ferret.",
  metadataBase: new URL('https://terrimo.homes'),
  openGraph: {
    title: "Terrimo — Immobilier Bassin d'Arcachon",
    description: "La carte interactive de l'immobilier sur le Bassin d'Arcachon",
    url: "https://terrimo.homes",
    siteName: "Terrimo",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Terrimo — Immobilier Bassin d'Arcachon",
    description: "La carte interactive de l'immobilier sur le Bassin d'Arcachon",
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
};

const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://terrimo.homes/#website',
      url: 'https://terrimo.homes',
      name: "Terrimo — Immobilier Bassin d'Arcachon",
      description: "Carte interactive de l'immobilier sur le Bassin d'Arcachon. Prix DVF, agences, biens.",
      inLanguage: 'fr-FR',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://terrimo.homes/?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://terrimo.homes/#organization',
      name: 'Terrimo',
      url: 'https://terrimo.homes',
      logo: 'https://terrimo.homes/icon.svg',
      areaServed: { '@type': 'Place', name: "Bassin d'Arcachon", containedInPlace: { '@type': 'Country', name: 'France' } },
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'contact@terrimo.homes', availableLanguage: 'French' },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
