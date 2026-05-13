/**
 * POST /api/upload?token=xxx
 * Upload une photo vers Cloudinary et retourne l'URL publique.
 *
 * Env requis :
 *   CLOUDINARY_CLOUD_NAME   → ex: "abc123def"  (Settings → "Cloud Name" en haut à gauche)
 *   CLOUDINARY_UPLOAD_PRESET → ex: "terrimo"  (Settings → Upload → Add upload preset → Unsigned)
 *
 * Body : FormData avec un champ "file" (image/*)
 * Réponse : { url: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    // Vérifier que le token est valide
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }
    const rows = await sql`SELECT id FROM acteurs WHERE access_token = ${token} LIMIT 1`;
    if (!rows.length) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const cloudName   = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      console.error('[upload] Variables CLOUDINARY_* manquantes');
      return NextResponse.json({ error: 'Configuration upload manquante' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Seules les images sont acceptées' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo)' }, { status: 400 });
    }

    // Upload vers Cloudinary via l'API REST (unsigned preset)
    const cloudForm = new FormData();
    cloudForm.append('file', file);
    cloudForm.append('upload_preset', uploadPreset);
    cloudForm.append('folder', 'terrimo/biens');

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: cloudForm }
    );
    const cloudData = await cloudRes.json() as { secure_url?: string; error?: { message: string } };

    if (!cloudRes.ok || !cloudData.secure_url) {
      console.error('[upload] Cloudinary error:', cloudData.error);
      return NextResponse.json({ error: cloudData.error?.message ?? 'Erreur Cloudinary' }, { status: 500 });
    }

    return NextResponse.json({ url: cloudData.secure_url });
  } catch (err) {
    console.error('[api/upload]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
