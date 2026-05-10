import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales | Terrimo',
  description: 'Mentions légales de Terrimo, plateforme immobilière du Bassin d\'Arcachon.',
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <main style={{
      maxWidth: 780,
      margin: '0 auto',
      padding: '4rem 1.5rem',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      color: '#1e293b',
      lineHeight: 1.7,
    }}>
      <Link href="/" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '.9rem' }}>
        ← Accueil
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>
        Mentions légales
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '.9rem' }}>
        Dernière mise à jour : mai 2025
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Éditeur du site
        </h2>
        <p>
          <strong>Terrimo</strong><br />
          Plateforme immobilière dédiée au Bassin d&apos;Arcachon<br />
          Email : <a href="mailto:contact@terrimo.homes" style={{ color: '#6366f1' }}>contact@terrimo.homes</a><br />
          Site web : <a href="https://terrimo.homes" style={{ color: '#6366f1' }}>terrimo.homes</a>
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Hébergement
        </h2>
        <p>
          Ce site est hébergé par <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
          <a href="https://vercel.com" style={{ color: '#6366f1' }} target="_blank" rel="noopener noreferrer">vercel.com</a>
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Propriété intellectuelle
        </h2>
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, images, graphismes, logo, etc.) est la propriété exclusive de Terrimo, sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation préalable est strictement interdite.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Données immobilières
        </h2>
        <p>
          Les données de transactions immobilières (DVF) proviennent de la base de données publique de l&apos;État français (data.gouv.fr), mise à disposition sous Licence Ouverte v2.0. Les estimations produites par Terrimo sont indicatives et ne constituent pas une expertise immobilière professionnelle.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Limitation de responsabilité
        </h2>
        <p>
          Terrimo met tout en œuvre pour fournir des informations exactes et à jour. Cependant, nous ne saurions être tenus responsables des erreurs, omissions ou des résultats obtenus de l&apos;utilisation de ces informations. L&apos;utilisation du site se fait sous la responsabilité exclusive de l&apos;utilisateur.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Cookies
        </h2>
        <p>
          Ce site utilise des cookies techniques nécessaires au bon fonctionnement du service. Aucun cookie publicitaire ou de tracking tiers n&apos;est déposé sans votre consentement.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Contact
        </h2>
        <p>
          Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à :<br />
          <a href="mailto:contact@terrimo.homes" style={{ color: '#6366f1' }}>contact@terrimo.homes</a>
        </p>
      </section>
    </main>
  );
}
