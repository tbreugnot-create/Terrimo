import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleapis.com' },
      { protocol: 'https', hostname: '**.gstatic.com' },
    ],
  },
  // Variables d'environnement exposées côté client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://terrimo.homes',
  },
};

export default nextConfig;
