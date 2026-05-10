import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Déposez votre recherche immobilière — Bassin d\'Arcachon | Terrimo',
  description: 'Décrivez votre projet d\'achat sur le Bassin d\'Arcachon. Les meilleures agences locales vous contactent directement si un bien correspond à votre profil. Gratuit et sans engagement.',
  alternates: { canonical: 'https://terrimo.homes/acquereur' },
  openGraph: {
    title: 'Trouvez votre bien sur le Bassin d\'Arcachon — Terrimo',
    description: 'Déposez votre mandat de recherche, les agences du Bassin vous contactent.',
    type: 'website',
    locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/acquereur',
  },
};

const HOW = [
  {
    n: '1',
    icon: '✏️',
    title: 'Décrivez votre projet',
    desc: 'Communes, budget, type de bien, financement… en 3 minutes.',
  },
  {
    n: '2',
    icon: '📡',
    title: 'Les agences sont alertées',
    desc: 'Les agences partenaires du Bassin reçoivent votre profil anonymisé en temps réel.',
  },
  {
    n: '3',
    icon: '📞',
    title: 'Vous êtes contacté directement',
    desc: 'Si un bien correspond, l\'agence vous appelle ou vous écrit. Sans intermédiaire.',
  },
];

const WHY = [
  { icon: '🎯', title: 'Off-market inclus', desc: 'Accédez aux biens avant leur publication publique grâce à nos agences partenaires.' },
  { icon: '🔒', title: 'Confidentialité totale', desc: 'Vos coordonnées ne sont partagées qu\'aux agences premium vérifiées. Jamais revendues.' },
  { icon: '🆓', title: '100% gratuit', desc: 'Le dépôt de mandat est totalement gratuit et sans engagement de votre part.' },
  { icon: '⚡', title: 'Réponse rapide', desc: 'La plupart des acquéreurs reçoivent une proposition dans les 48h après dépôt.' },
];

const COMMUNES = [
  'Arcachon', 'La Teste-de-Buch', 'Andernos-les-Bains', 'Lège-Cap-Ferret',
  'Gujan-Mestras', 'Le Teich', 'Audenge', 'Biganos', 'Biscarrosse',
];

export default function AcquereurLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
            Terri<span style={{ color: '#38bdf8' }}>mo</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 14 }}>Voir les biens</Link>
          <Link href="/pro/rejoindre" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 14 }}>Espace pro</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: 20, padding: '4px 14px',
          background: 'rgba(56,189,248,.12)', border: '1px solid rgba(56,189,248,.3)',
          borderRadius: 20, fontSize: 13, color: '#7dd3fc',
        }}>
          🌊 Bassin d&apos;Arcachon · Service gratuit pour les acquéreurs
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
          Trouvez votre bien sur<br />
          <span style={{ color: '#38bdf8' }}>le Bassin d&apos;Arcachon</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.65)', lineHeight: 1.6, marginBottom: 36, maxWidth: 540, margin: '0 auto 36px' }}>
          Déposez votre mandat de recherche en 3 minutes. Les meilleures agences locales vous contactent directement si un bien correspond à votre projet.
        </p>

        <Link href="/acquereur/inscrire" style={{
          display: 'inline-block', padding: '16px 36px',
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          color: '#fff', textDecoration: 'none', borderRadius: 14,
          fontWeight: 800, fontSize: 17,
          boxShadow: '0 8px 32px rgba(14,165,233,.35)',
        }}>
          Déposer ma recherche gratuitement →
        </Link>
        <p style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
          Gratuit · Sans engagement · Réponse sous 48h
        </p>

        {/* Communes pills */}
        <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {COMMUNES.map(c => (
            <span key={c} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12,
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.6)',
            }}>
              📍 {c}
            </span>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40 }}>
          Comment ça marche ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {HOW.map(step => (
            <div key={step.n} style={{
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 20, padding: 28, textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(56,189,248,.15)', border: '1px solid rgba(56,189,248,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, margin: '0 auto 16px',
              }}>
                {step.icon}
              </div>
              <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Étape {step.n}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi Terrimo */}
      <section style={{
        background: 'rgba(255,255,255,.025)', borderTop: '1px solid rgba(255,255,255,.06)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40 }}>
            Pourquoi déposer sur Terrimo ?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {WHY.map(w => (
              <div key={w.title} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 16, padding: 24,
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{w.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{w.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 20, padding: 32, marginBottom: 40,
        }}>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,.8)', marginBottom: 16, fontStyle: 'italic' }}>
            &ldquo;En 24h après mon dépôt, deux agences m&apos;ont appelé avec des biens qui correspondaient exactement à mes critères. J&apos;avais cherché seul pendant 6 mois.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
            — Marie-Christine T. · Acquéreur à Arcachon · Résidence secondaire
          </p>
        </div>

        <Link href="/acquereur/inscrire" style={{
          display: 'inline-block', padding: '16px 40px',
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          color: '#fff', textDecoration: 'none', borderRadius: 14,
          fontWeight: 800, fontSize: 17,
          boxShadow: '0 8px 32px rgba(14,165,233,.3)',
        }}>
          Je dépose ma recherche →
        </Link>
        <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
          3 minutes · Confidentiel · 0€
        </p>
      </section>

      {/* Footer minimal */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px',
        textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13,
      }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>terrimo.homes</Link>
        {' · '}
        <Link href="/contact" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Contact</Link>
        {' · '}
        <Link href="/tarifs" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Espace pro</Link>
      </footer>
    </div>
  );
}
