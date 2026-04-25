import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

const BASE = 'https://terrimo.homes';

const COMMUNES = [
  'arcachon', 'la-teste-de-buch', 'andernos-les-bains', 'lege-cap-ferret',
  'gujan-mestras', 'le-teich', 'audenge', 'biganos', 'mios', 'salles',
  'cazaux', 'biscarrosse', 'marcheprime',
];

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,             lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/evaluer`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/pro/rejoindre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ...COMMUNES.map(slug => ({
    url: `${BASE}/quartier/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let agences: MetadataRoute.Sitemap = [];
  let conciergeries: MetadataRoute.Sitemap = [];
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

  return [...STATIC, ...agences, ...conciergeries, ...biens];
}
