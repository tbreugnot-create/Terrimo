import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Biens off-market Bassin d'Arcachon — Accès exclusif avant publication | Terrimo",
  description: "Accédez aux biens immobiliers avant leur mise en vente publique sur le Bassin d'Arcachon. Villas, maisons, appartements — off-market Arcachon, Cap Ferret, La Teste. Inscription gratuite.",
  alternates: { canonical: 'https://terrimo.homes/off-market' },
  openGraph: {
    title: "Biens off-market Bassin d'Arcachon — Accès exclusif | Terrimo",
    description: "Biens immobiliers exclusifs avant publication sur le Bassin d'Arcachon.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/off-market',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Biens off-market Bassin d'Arcachon",
  url: 'https://terrimo.homes/off-market',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Off-market', item: 'https://terrimo.homes/off-market' },
    ],
  },
};

const ETAPES = [
  {
    n: '01',
    icon: '✏️',
    title: 'Déposez votre profil',
    desc: 'Budget, commune cible, type de bien, surface. 3 minutes, sans engagement.',
  },
  {
    n: '02',
    icon: '🤝',
    title: 'Nos agences vous matchent',
    desc: 'Les agences partenaires consultent régulièrement les profils acquéreurs pour proposer leurs biens off-market.',
  },
  {
    n: '03',
    icon: '🔑',
    title: 'Vous visitez en exclusivité',
    desc: 'Le bien ne sera jamais publié tant que vous négociez. Aucune concurrence.',
  },
];

const AVANTAGES = [
  { icon: '🚀', title: 'Avant tout le monde', desc: 'Certains biens sont vendus en 48h après la première visite. L\'off-market vous donne une longueur d\'avance.' },
  { icon: '💬', title: 'Vendeurs plus ouverts', desc: 'Un vendeur off-market n\'a pas encore subi les négociations publiques. Les discussions sont souvent plus sereines.' },
  { icon: '🔒', title: 'Discrétion totale', desc: 'Votre profil est transmis aux agences de manière anonymisée. Vos coordonnées ne sont partagées qu\'aux agences que vous choisissez.' },
  { icon: '🏡', title: 'Biens rares et atypiques', desc: 'Villas vue mer, propriétés ostréicoles, maisons de famille — les biens les plus recherchés du Bassin circulent d\'abord en off-market.' },
];

export default function OffMarketPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero dark */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
          padding: '72px 20px 64px',
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: 24, display: 'flex', gap: 6, justifyContent: 'center' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span><span>Off-market</span>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 24, padding: '5px 16px',
              background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)',
              borderRadius: 20, fontSize: 13, color: '#fbbf24', fontWeight: 600,
            }}>
              🔒 Accès réservé aux acquéreurs qualifiés
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Biens <span style={{ color: '#fbbf24' }}>off-market</span><br />
              Bassin d&apos;Arcachon
            </h1>

            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 520 }}>
              Accédez aux villas, maisons et appartements disponibles <strong style={{ color: 'white' }}>avant leur mise en vente publique</strong>.
              Les meilleurs biens du Bassin ne paraissent jamais sur SeLoger.
            </p>

            <Link href="/acquereur" style={{
              display: 'inline-block', padding: '16px 40px', borderRadius: 16,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#0a1626', fontWeight: 900, fontSize: '1.0625rem',
              textDecoration: 'none', boxShadow: '0 8px 32px rgba(251,191,36,.3)',
            }}>
              Déposer mon profil acquéreur →
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginTop: 14 }}>
              Gratuit · Sans engagement · Réponse sous 48h
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 20px 60px' }}>

          {/* Comment ça marche */}
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', color: '#0f172a', margin: '0 0 40px' }}>
              Comment fonctionne l&apos;off-market Terrimo ?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              {ETAPES.map(e => (
                <div key={e.n} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.25rem', color: '#0a1626',
                  }}>
                    {e.n}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{e.icon}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: 8 }}>{e.title}</div>
                  <div style={{ fontSize: '.875rem', color: '#64748b', lineHeight: 1.6 }}>{e.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Avantages */}
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.125rem, 3vw, 1.375rem)', color: '#0f172a', margin: '0 0 24px' }}>
              Pourquoi l&apos;off-market ?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {AVANTAGES.map(a => (
                <div key={a.title} style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px',
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: 12 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', marginBottom: 8 }}>{a.title}</div>
                  <div style={{ fontSize: '.8125rem', color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Exemples types de biens */}
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.125rem, 3vw, 1.375rem)', color: '#0f172a', margin: '0 0 20px' }}>
              Exemples de biens circulant en off-market
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {[
                { icon: '🌊', type: 'Villa vue mer · Arcachon', prix: '2,4 M€', detail: '5 pièces · 220 m² · Piscine · Jamais publié' },
                { icon: '🦪', type: 'Propriété ostréicole · Cap Ferret', prix: '1,8 M€', detail: 'Maison + cabane + accès eau · Unique' },
                { icon: '🌿', type: 'Maison de famille · La Teste', prix: '870 K€', detail: '7 pièces · Grand terrain · 1ère vente en 40 ans' },
                { icon: '🏢', type: 'Appartement vue bassin · Arcachon', prix: '490 K€', detail: '3 pièces · 68 m² · Étage élevé · Off-market direct propriétaire' },
              ].map(b => (
                <div key={b.type} style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
                  padding: '18px', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                  }} />
                  <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{b.icon}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9rem', marginBottom: 4 }}>{b.type}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#fbbf24', marginBottom: 6 }}>{b.prix}</div>
                  <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>{b.detail}</div>
                  <div style={{ marginTop: 10, fontSize: '.75rem', fontWeight: 600, color: '#64748b' }}>🔒 Accès sur profil validé</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>
              * Exemples illustratifs — les biens off-market réels sont transmis directement par les agences aux profils correspondants.
            </p>
          </section>

          {/* CTA final */}
          <section style={{ textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0a1626, #0f2040)',
              borderRadius: 24, padding: '48px 32px',
              display: 'inline-block', width: '100%', maxWidth: 560,
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔑</div>
              <h3 style={{ fontWeight: 900, color: 'white', fontSize: '1.375rem', margin: '0 0 12px' }}>
                Déposez votre profil acquéreur
              </h3>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9375rem', margin: '0 0 28px', lineHeight: 1.6 }}>
                Gratuit. Les agences partenaires du Bassin vous contactent si un bien off-market correspond à votre recherche.
              </p>
              <Link href="/acquereur" style={{
                display: 'inline-block', padding: '14px 32px', borderRadius: 14,
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#0a1626', fontWeight: 900, fontSize: '1rem', textDecoration: 'none',
              }}>
                Déposer mon profil acquéreur →
              </Link>
              <div style={{ marginTop: 16, display: 'flex', gap: 24, justifyContent: 'center', fontSize: '.8125rem', color: 'rgba(255,255,255,.3)' }}>
                <span>✓ Gratuit</span>
                <span>✓ Sans engagement</span>
                <span>✓ Profil confidentiel</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
