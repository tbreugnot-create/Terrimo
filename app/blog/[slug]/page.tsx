import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ARTICLES } from '../articles';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} | Terrimo Blog`,
    description: article.excerpt,
    keywords: article.keywords,
    alternates: { canonical: `https://terrimo.homes/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      locale: 'fr_FR',
      siteName: "Terrimo — Bassin d'Arcachon",
      publishedTime: article.date,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);
  if (!article) notFound();

  const idx = ARTICLES.findIndex(a => a.slug === slug);
  const prev = idx > 0 ? ARTICLES[idx - 1] : null;
  const next = idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.dateISO ?? article.date,
    dateModified: article.dateISO ?? article.date,
    author: {
      '@type': 'Organization',
      name: 'Terrimo',
      url: 'https://terrimo.homes',
      logo: { '@type': 'ImageObject', url: 'https://terrimo.homes/logo.png' },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Terrimo',
      url: 'https://terrimo.homes',
      logo: { '@type': 'ImageObject', url: 'https://terrimo.homes/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://terrimo.homes/blog/${slug}` },
    keywords: article.keywords.join(', '),
    articleSection: article.category,
    inLanguage: 'fr-FR',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://terrimo.homes/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://terrimo.homes/blog/${slug}` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
        padding: '48px 20px 40px',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)', marginBottom: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
            <span>›</span>
            <Link href="/blog" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Blog</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,.6)' }}>{article.category}</span>
          </div>

          {/* Category badge */}
          <span style={{
            fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em',
            color: '#38bdf8', background: 'rgba(56,189,248,.12)',
            padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '16px',
          }}>
            {article.category.toUpperCase()}
          </span>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: 'white', lineHeight: 1.2, margin: '0 0 14px' }}>
            {article.title}
          </h1>

          {/* Excerpt */}
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.0625rem', lineHeight: 1.6, margin: '0 0 20px' }}>
            {article.excerpt}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '.8125rem', color: 'rgba(255,255,255,.4)',
            }}>
              <span>📅</span>{article.date}
            </span>
            <span style={{ color: 'rgba(255,255,255,.25)' }}>·</span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '.8125rem', color: 'rgba(255,255,255,.4)',
            }}>
              <span>⏱</span>{article.readTime} de lecture
            </span>
            <span style={{ color: 'rgba(255,255,255,.25)' }}>·</span>
            <span style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)' }}>Par l&apos;équipe Terrimo</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 64px', display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>

        {/* Emoji banner */}
        <div style={{
          background: article.color, borderRadius: '16px',
          height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem',
        }}>
          {article.emoji}
        </div>

        {/* Article body */}
        <article
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* CTA bloc */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 100%)',
          borderRadius: '20px', padding: '36px 32px', textAlign: 'center',
        }}>
          <p style={{ color: '#38bdf8', fontWeight: 700, fontSize: '1rem', margin: '0 0 8px' }}>
            Vous avez un projet immobilier sur le Bassin ?
          </p>
          <h3 style={{ color: 'white', fontSize: '1.375rem', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.3 }}>
            Estimez votre bien gratuitement
          </h3>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9375rem', margin: '0 0 24px', lineHeight: 1.6 }}>
            Notre algorithme DVF vous donne une estimation instantanée basée sur les transactions réelles du Bassin d&apos;Arcachon.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/evaluer" style={{
              background: '#38bdf8', color: '#0a1626',
              fontWeight: 800, fontSize: '1rem', padding: '14px 28px',
              borderRadius: '10px', textDecoration: 'none', display: 'inline-block',
            }}>
              Estimer mon bien →
            </Link>
            <Link href="/marche" style={{
              background: 'rgba(255,255,255,.08)', color: 'white',
              fontWeight: 600, fontSize: '1rem', padding: '14px 28px',
              borderRadius: '10px', textDecoration: 'none', display: 'inline-block',
              border: '1px solid rgba(255,255,255,.15)',
            }}>
              Prix du marché DVF
            </Link>
          </div>
        </div>

        {/* Maillage interne — annonces par commune */}
        {article.communes && article.communes.length > 0 && (
          <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '24px',
          }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 14, letterSpacing: '.06em' }}>
              ANNONCES IMMOBILIÈRES DANS CES COMMUNES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {article.communes.map(slug => {
                const label = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <a key={slug} href={`/vente/${slug}`} style={{
                    padding: '7px 16px', borderRadius: 20,
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    color: '#475569', fontSize: '.875rem', fontWeight: 500,
                    textDecoration: 'none',
                  }}>
                    🏠 Ventes {label}
                  </a>
                );
              })}
              {article.communes.map(slug => {
                const label = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <a key={`loc-${slug}`} href={`/location/${slug}`} style={{
                    padding: '7px 16px', borderRadius: 20,
                    background: '#f0fdf4', border: '1px solid #dcfce7',
                    color: '#16a34a', fontSize: '.875rem', fontWeight: 500,
                    textDecoration: 'none',
                  }}>
                    🔑 Locations {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation prev/next */}
        {(prev || next) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {prev ? (
              <Link href={`/blog/${prev.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '16px',
                }}
                >
                  <div style={{ fontSize: '.75rem', color: '#94a3b8', marginBottom: '6px' }}>← Article précédent</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{prev.title}</div>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/blog/${next.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '16px', textAlign: 'right',
                }}
                >
                  <div style={{ fontSize: '.75rem', color: '#94a3b8', marginBottom: '6px' }}>Article suivant →</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{next.title}</div>
                </div>
              </Link>
            ) : <div />}
          </div>
        )}

        {/* Back to blog */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/blog" style={{
            color: '#6366f1', fontWeight: 600, fontSize: '.9375rem',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            ← Retour au blog
          </Link>
        </div>
      </div>

      <style>{`
        .article-content {
          font-size: 1.0625rem;
          line-height: 1.8;
          color: #334155;
        }
        .article-content h2 {
          font-size: 1.375rem;
          font-weight: 800;
          color: #0f172a;
          margin: 2em 0 .75em;
          line-height: 1.3;
        }
        .article-content h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin: 1.75em 0 .6em;
        }
        .article-content p {
          margin: 0 0 1.25em;
        }
        .article-content strong {
          color: #0f172a;
          font-weight: 700;
        }
        .article-content ul, .article-content ol {
          padding-left: 1.5em;
          margin: 0 0 1.25em;
        }
        .article-content li {
          margin-bottom: .5em;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: .9375rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 0 1px #e2e8f0;
        }
        .article-content th {
          background: #0c2240;
          color: white;
          font-weight: 700;
          padding: 10px 14px;
          text-align: left;
          font-size: .875rem;
        }
        .article-content td {
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .article-content tr:nth-child(even) td {
          background: #f8fafc;
        }
        .article-content blockquote {
          border-left: 4px solid #38bdf8;
          background: #f0f9ff;
          margin: 1.5em 0;
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
          color: #0c4a6e;
          font-style: italic;
        }
        .article-content a {
          color: #6366f1;
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .article-content table {
            font-size: .8rem;
          }
          .article-content th, .article-content td {
            padding: 8px 10px;
          }
        }
      `}</style>
    </div>
  );
}
