import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Terrimo',
  description: 'Politique de confidentialité et protection des données personnelles de Terrimo.',
  robots: { index: false },
};

export default function ConfidentialitePage() {
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
        Politique de confidentialité
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '.9rem' }}>
        Dernière mise à jour : mai 2025
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Responsable du traitement
        </h2>
        <p>
          <strong>Terrimo</strong> est responsable du traitement de vos données personnelles collectées via le site terrimo.homes.<br />
          Contact DPO : <a href="mailto:contact@terrimo.homes" style={{ color: '#6366f1' }}>contact@terrimo.homes</a>
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Données collectées
        </h2>
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li><strong>Données de contact</strong> : adresse email (lors de l&apos;inscription Pro ou de la demande de mise en relation)</li>
          <li><strong>Données de navigation</strong> : pages visitées, actions sur la carte (sans identification personnelle)</li>
          <li><strong>Données immobilières</strong> : critères de recherche ou d&apos;estimation (bien type, surface, localisation)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Finalités du traitement
        </h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Fourniture du service d&apos;estimation et de mise en relation</li>
          <li>Authentification des professionnels (magic link)</li>
          <li>Amélioration de l&apos;expérience utilisateur</li>
          <li>Communications transactionnelles (lien de connexion, résultats d&apos;estimation)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Base légale
        </h2>
        <p>
          Le traitement de vos données repose sur votre consentement (art. 6.1.a RGPD) et sur l&apos;exécution du contrat de service (art. 6.1.b RGPD) pour les professionnels inscrits.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Durée de conservation
        </h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Données de compte Pro : durée de la relation contractuelle + 3 ans</li>
          <li>Données de navigation : 13 mois maximum</li>
          <li>Emails de contact : 3 ans après le dernier échange</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Sous-traitants
        </h2>
        <p>Nous utilisons les sous-traitants suivants, tous conformes au RGPD :</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li><strong>Vercel</strong> (hébergement, CDN)</li>
          <li><strong>Neon</strong> (base de données PostgreSQL)</li>
          <li><strong>Resend</strong> (envoi d&apos;emails transactionnels)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Vos droits
        </h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Droit d&apos;accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l&apos;effacement (&laquo;&nbsp;droit à l&apos;oubli&nbsp;&raquo;)</li>
          <li>Droit à la portabilité</li>
          <li>Droit d&apos;opposition au traitement</li>
        </ul>
        <p style={{ marginTop: '0.75rem' }}>
          Pour exercer ces droits : <a href="mailto:contact@terrimo.homes" style={{ color: '#6366f1' }}>contact@terrimo.homes</a>
          <br />
          Vous pouvez également adresser une réclamation à la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>CNIL</a>.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
          Cookies
        </h2>
        <p>
          Terrimo utilise uniquement des cookies techniques essentiels au fonctionnement du site (session, préférences). Aucun cookie publicitaire n&apos;est déposé. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut altérer certaines fonctionnalités.
        </p>
      </section>
    </main>
  );
}
