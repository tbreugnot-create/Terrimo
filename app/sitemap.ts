import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';
import { ARTICLES } from './blog/articles';

const BASE = 'https://terrimo.homes';

const COMMUNES = [
  'arcachon', 'la-teste-de-buch', 'andernos-les-bains', 'lege-cap-ferret',
  'gujan-mestras', 'le-teich', 'audenge', 'biganos', 'mios', 'salles',
  'cazaux', 'biscarrosse', 'marcheprime',
];

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/evaluer`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/tarifs`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
  { url: `${BASE}/pro/rejoindre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE}/acquereur`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/marche`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.88 },
  { url: `${BASE}/vendre`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
  { url: `${BASE}/blog`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.82 },
  { url: `${BASE}/louer`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.83 },
  { url: `${BASE}/investir`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.82 },
  { url: `${BASE}/off-market`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.80 },
  { url: `${BASE}/agences`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.80 },
  { url: `${BASE}/conciergeries`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.80 },
  { url: `${BASE}/diagnostiqueurs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.78 },
  { url: `${BASE}/notaires`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.78 },
  { url: `${BASE}/vente`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.85 },
  { url: `${BASE}/location`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.83 },
  { url: `${BASE}/favoris`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/mentions-legales`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  { url: `${BASE}/confidentialite`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  ...ARTICLES.map(a => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  })),
  ...COMMUNES.map(slug => ({
    url: `${BASE}/quartier/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })),
  ...COMMUNES.map(slug => ({
    url: `${BASE}/vente/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  })),
  ...COMMUNES.map(slug => ({
    url: `${BASE}/location/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.82,
  })),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let agences: MetadataRoute.Sitemap = [];
  let conciergeries: MetadataRoute.Sitemap = [];
  let diagnostiqueurs: MetadataRoute.Sitemap = [];
  let notaires: MetadataRoute.Sitemap = [];
  let biens: MetadataRoute.Sitemap = [];

  try {
    const acteurRows = await sql`
      SELECT slug, type, updated_at
      FROM acteurs
      WHERE is_active = true AND slug IS NOT NULL
      ORDER BY type, slug
    `;
    agences = acteurRows
      .filter((r: Record<string, unknown>) => r.type === 'agence')
      .map((r: Record<string, unknown>) => ({
        url: `${BASE}/agence/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    conciergeries = acteurRows
      .filter((r: Record<string, unknown>) => r.type === 'conciergerie')
      .map((r: Record<string, unknown>) => ({
        url: `${BASE}/conciergerie/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    diagnostiqueurs = acteurRows
      .filter((r: Record<string, unknown>) => r.type === 'diagnostiqueur')
      .map((r: Record<string, unknown>) => ({
        url: `${BASE}/diagnostiqueur/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    notaires = acteurRows
      .filter((r: Record<string, unknown>) => r.type === 'notaire')
      .map((r: Record<string, unknown>) => ({
        url: `${BASE}/notaire/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    const bienRows = await sql`
      SELECT id, updated_at FROM biens
      WHERE is_active = true
      ORDER BY updated_at DESC
      LIMIT 500
    `;
    biens = bienRows.map((r: Record<string, unknown>) => ({
      url: `${BASE}/bien/${r.id}`,
      lastModified: r.updated_at ? new Date(r.updated_at as string) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }));
  } catch {
    // En cas d'erreur DB, on retourne les URLs statiques
  }

  return [...STATIC, ...agences, ...conciergeries, ...diagnostiqueurs, ...notaires, ...biens];
}
