// ─── Types partagés Terrimo ────────────────────────────────
// Ce fichier centralise les interfaces réutilisées entre plusieurs
// pages (agence, conciergerie, bien…). Ne jamais importer ces types
// depuis un fichier page.tsx ou layout.tsx d'une autre route.

export interface ActeurDetail {
  id: number;
  name: string;
  type: string;
  slug: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  commune?: string;
  google_rating?: number;
  google_reviews?: number;
  is_verified: boolean;
  plan: string;
  meta?: {
    services?: string[];
    certifications?: string[];
    description?: string;
    zones_couvertes?: string[];
    tarif_gestion?: string;
  };
}

export interface BienPreview {
  id: number;
  type_annonce: string;
  type_bien: string;
  titre?: string;
  prix?: number;
  surface?: number;
  pieces?: number;
  commune?: string;
  photos: { url: string }[];
  is_featured: boolean;
}
