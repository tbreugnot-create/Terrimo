import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Resend } from 'resend';
import { syncAcquereurToOdoo } from '@/lib/odoo';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'Terrimo <notifications@terrimo.homes>';

// ─── POST /api/mandats — créer un mandat de recherche ────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prenom, email, phone,
      type_acquisition, horizon, premiere_acquisition,
      communes, proximites, accepte_renovation,
      types_bien, surface_min, surface_max, chambres_min,
      terrain_souhaite, terrain_min, caracteristiques,
      budget_max, budget_travaux, apport,
      mode_financement, accord_bancaire, sci, eligible_ptz,
      vente_conditionnee, accepte_copropriete, charges_max, dpe_acceptes,
      description,
    } = body;

    if (!email || !budget_max || !communes?.length) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Insérer le mandat
    const rows = await sql`
      INSERT INTO mandats_recherche (
        prenom, email, phone,
        type_acquisition, horizon, premiere_acquisition,
        communes, proximites, accepte_renovation,
        types_bien, surface_min, surface_max, chambres_min,
        terrain_souhaite, terrain_min, caracteristiques,
        budget_max, budget_travaux, apport,
        mode_financement, accord_bancaire, sci, eligible_ptz,
        vente_conditionnee, accepte_copropriete, charges_max, dpe_acceptes,
        description
      ) VALUES (
        ${prenom ?? null}, ${email}, ${phone ?? null},
        ${type_acquisition ?? null}, ${horizon ?? null}, ${premiere_acquisition ?? false},
        ${communes ?? []}, ${proximites ?? []}, ${accepte_renovation ?? true},
        ${types_bien ?? []}, ${surface_min ?? null}, ${surface_max ?? null}, ${chambres_min ?? null},
        ${terrain_souhaite ?? false}, ${terrain_min ?? null}, ${caracteristiques ?? []},
        ${budget_max}, ${budget_travaux ?? null}, ${apport ?? null},
        ${mode_financement ?? null}, ${accord_bancaire ?? false}, ${sci ?? false}, ${eligible_ptz ?? false},
        ${vente_conditionnee ?? false}, ${accepte_copropriete ?? true}, ${charges_max ?? null}, ${dpe_acceptes ?? []},
        ${description ?? null}
      )
      RETURNING id, token
    `;

    const mandat = rows[0];

    // Sync Odoo contact acquéreur (fire & forget)
    syncAcquereurToOdoo({
      prenom: prenom ?? undefined,
      email,
      phone: phone ?? undefined,
      communes: communes ?? [],
      budget_max: budget_max ?? null,
      type_acquisition: type_acquisition ?? undefined,
      horizon: horizon ?? undefined,
      mode_financement: mode_financement ?? undefined,
      accord_bancaire: accord_bancaire ?? false,
      description: description ?? undefined,
      mandatNeonId: mandat.id,
    }).catch(() => {});

    // Email de confirmation à l'acquéreur
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Votre alerte de recherche est active — Terrimo',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff">
          <div style="margin-bottom:24px">
            <span style="font-size:1.5rem;font-weight:800;color:#0f1923;letter-spacing:-0.02em">Terri<span style="color:#0ea5e9">mo</span></span>
          </div>
          <h1 style="font-size:1.375rem;font-weight:700;color:#0f1923;margin-bottom:8px">
            Bonjour ${prenom ?? ''} 👋
          </h1>
          <p style="color:#546e7a;line-height:1.6;margin-bottom:24px">
            Votre alerte de recherche est bien enregistrée. Les agences partenaires du Bassin d'Arcachon en seront informées et pourront vous contacter directement si un bien correspond à votre profil.
          </p>
          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="font-weight:600;color:#0f1923;margin-bottom:12px">Votre recherche en résumé :</p>
            <ul style="color:#546e7a;line-height:1.8;padding-left:20px;margin:0">
              <li>Communes : ${(communes ?? []).join(', ')}</li>
              <li>Budget max : ${budget_max ? new Intl.NumberFormat('fr-FR', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(budget_max) : '—'}</li>
              ${surface_min ? `<li>Surface : ${surface_min} m² min</li>` : ''}
              ${chambres_min ? `<li>Chambres : ${chambres_min} min</li>` : ''}
              ${mode_financement ? `<li>Financement : ${mode_financement}</li>` : ''}
            </ul>
          </div>
          <p style="color:#78909c;font-size:.875rem;line-height:1.6">
            Votre alerte est active pendant 3 mois. Nous vous enverrons un rappel avant expiration.<br>
            Pour modifier ou supprimer votre alerte, répondez à cet email.
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
          <p style="color:#b0bec5;font-size:.75rem">Terrimo — <a href="https://terrimo.homes" style="color:#0ea5e9">terrimo.homes</a></p>
        </div>
      `,
    });

    // Notifier les agences des communes concernées
    await notifyAgencies(mandat.id, body);

    return NextResponse.json({ success: true, token: mandat.token });
  } catch (err) {
    console.error('[POST /api/mandats]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── Notification agences ─────────────────────────────────
async function notifyAgencies(mandatId: number, data: Record<string, unknown>) {
  const communes = (data.communes as string[]) ?? [];
  if (!communes.length) return;

  try {
    // Récupérer les agences et notaires actifs dans les communes concernées
    const agences = await sql`
      SELECT DISTINCT name, email, commune, access_token
      FROM acteurs
      WHERE is_active = true
        AND type IN ('agence', 'notaire')
        AND email IS NOT NULL
        AND commune ILIKE ANY(${communes.map((c: string) => `%${c}%`)})
      LIMIT 30
    `;

    if (!agences.length) return;

    const budget = data.budget_max
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.budget_max as number)
      : '—';

    const resumé = [
      data.types_bien ? `${(data.types_bien as string[]).join('/')}` : 'Bien',
      data.chambres_min ? `${data.chambres_min}+ chambres` : '',
      `Budget ${budget}`,
      data.mode_financement === 'comptant' ? '💰 Comptant' : data.accord_bancaire ? '✅ Accord bancaire' : '',
      communes.join(', '),
    ].filter(Boolean).join(' · ');

    // Envoi groupé (max 30 agences)
    await Promise.allSettled(
      agences.map((a: Record<string, unknown>) =>
        resend.emails.send({
          from: FROM,
          to: a.email as string,
          subject: `🔔 Nouveau profil acquéreur sur votre secteur — Terrimo`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff">
              <div style="margin-bottom:20px">
                <span style="font-size:1.4rem;font-weight:800;color:#0f1923">Terri<span style="color:#0ea5e9">mo</span></span>
              </div>
              <h1 style="font-size:1.25rem;font-weight:700;color:#0f1923;margin-bottom:8px">
                Nouveau profil acquéreur 🔔
              </h1>
              <p style="color:#546e7a;line-height:1.6;margin-bottom:20px">
                Un acquéreur vient de créer une alerte de recherche sur votre secteur.
              </p>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px">
                <p style="font-weight:700;color:#1e40af;font-size:1rem;margin-bottom:4px">Profil anonymisé</p>
                <p style="color:#1e3a8a;font-size:1.0625rem;line-height:1.6;margin:0">${resumé}</p>
              </div>
              <div style="margin-bottom:24px">
                <p style="color:#546e7a;font-size:.9rem;line-height:1.6">
                  ${data.description ? `<em>"${data.description}"</em><br><br>` : ''}
                  Si vous avez un bien correspondant à ce profil, connectez-vous à votre espace Terrimo pour accéder aux coordonnées de l'acquéreur.
                </p>
              </div>
              <a href="${a.access_token ? `https://terrimo.homes/pro/dashboard/${a.access_token as string}` : 'https://terrimo.homes/pro/dashboard'}"
                 style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:white;border-radius:10px;text-decoration:none;font-weight:700;font-size:.9375rem">
                Voir les profils acquéreurs →
              </a>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
              <p style="color:#b0bec5;font-size:.75rem">
                Terrimo — <a href="https://terrimo.homes" style="color:#0ea5e9">terrimo.homes</a><br>
                Vous recevez cet email car votre agence est partenaire Terrimo sur ${a.commune as string}.
              </p>
            </div>
          `,
        })
      )
    );

    // Marquer comme notifié
    await sql`UPDATE mandats_recherche SET notified_at = NOW() WHERE id = ${mandatId}`;
  } catch (err) {
    console.error('[notifyAgencies]', err);
  }
}
