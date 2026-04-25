import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
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
