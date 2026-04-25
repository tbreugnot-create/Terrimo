import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/pro/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://terrimo.homes/sitemap.xml',
    host: 'https://terrimo.homes',
  };
}
