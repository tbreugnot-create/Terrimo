import { Metadata } from 'next';
import Link from 'next/link';
import { ARTICLES } from './articles';

export const metadata: Metadata = {
  title: "Blog Immobilier Bassin d'Arcachon — Conseils & Marché | Terrimo",
  description: "Guides, analyses de marché et conseils immobiliers pour acheter, vendre ou investir sur le Bassin d'Arcachon. Données DVF, réglementations, tendances 2025.",
  alternates: { canonical: 'https://terrimo.homes/blog' },
  openGraph: {
    title: "Blog Immobilier Bassin d'Arcachon — Terrimo",
    description: "Conseils, analyses DVF et tendances immobilières sur le Bassin d'Arcachon.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
  },
};

export default function BlogPage() {
  const featured = ARTICLES[0];
  const rest = ARTICLES.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
        padding: '56px 20px 48px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: '16px', display: 'flex', gap: '6px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
            <span>›</span><span>Blog</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 12px' }}>
            Blog Immobilier<br />
            <span style={{ color: '#38bdf8' }}>Bassin d&apos;Arcachon</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1.0625rem', margin: 0, maxWidth: '500px', lineHeight: 1.6 }}>
            Conseils d&apos;experts, analyses de marché DVF et guides pratiques pour acheter, vendre ou investir sur le Bassin.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 64px' }}>

        {/* Article à la une */}
        <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '32px' }}>
          <div style={{
            background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0',
            overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr',
            transition: 'box-shadow .15s',
          }}
            className="featured-card"
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            {/* Image */}
            <div style={{ background: featured.color, minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
              {featured.emoji}
            </div>
            {/* Content */}
            <div style={{ padding: '32px' }}>
              <span style={{
                fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em',
                color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: '20px',
              }}>
                À LA UNE
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 10px', lineHeight: 1.3 }}>
                {featured.title}
              </h2>
              <p style={{ color: '#64748b', fontSize: '.9rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                {featured.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.8125rem', color: '#94a3b8' }}>{featured.date}</span>
                <span style={{ fontSize: '.8125rem', color: '#94a3b8' }}>·</span>
                <span style={{ fontSize: '.8125rem', color: '#94a3b8' }}>{featured.readTime}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Grille articles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {rest.map(article => (
            <Link key={article.slug} href={`/blog/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                overflow: 'hidden', height: '100%', transition: 'box-shadow .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{
                  background: article.color, height: '120px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                }}>
                  {article.emoji}
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{
                    fontSize: '.75rem', fontWeight: 600, color: '#6366f1',
                    background: '#eef2ff', padding: '2px 8px', borderRadius: '12px',
                  }}>
                    {article.category}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '10px 0 8px', lineHeight: 1.3 }}>
                    {article.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '.875rem', lineHeight: 1.5, margin: '0 0 12px' }}>
                    {article.excerpt}
                  </p>
                  <div style={{ fontSize: '.8rem', color: '#94a3b8', display: 'flex', gap: '8px' }}>
                    <span>{article.date}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 600px) {
          .featured-card { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
