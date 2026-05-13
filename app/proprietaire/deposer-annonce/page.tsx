import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Déposer une annonce gratuite | Terrimo — Bassin d\'Arcachon',
  description:
    'Publiez votre bien immobilier gratuitement sur la carte Terrimo. Suivez nos 4 conseils clés pour vendre ou louer plus vite sur le Bassin d\'Arcachon.',
};

/* ─── Données statiques ──────────────────────────────────── */

const ETAPES = [
  {
    num: '01',
    icon: '📸',
    title: 'Téléchargez vos meilleures photos et, si possible, un plan',
    bullets: [
      'Veillez à disposer de photos de qualité. Vous pouvez les ajouter plus tard, mais sans photos, vos chances d\'obtenir des contacts sont très faibles.',
      'La photo principale est cruciale : c\'est la seule qui apparaît dans les résultats de recherche et dans les alertes e-mail des acheteurs.',
      'Disposez vos photos de manière logique — de l\'entrée au jardin — et privilégiez les images horizontales, plus impactantes.',
      'Même un plan dessiné à la main aide les visiteurs à visualiser la disposition des pièces et à se projeter.',
    ],
    tip: {
      icon: '💡',
      text: 'Astuce photo : filmez chaque pièce en vidéo courte puis faites une capture des meilleures images. La lumière naturelle en milieu de journée donne les meilleurs résultats.',
    },
  },
  {
    num: '02',
    icon: '📍',
    title: 'Indiquez l\'adresse exacte',
    bullets: [
      'Pour que les acheteurs qui cherchent dans votre secteur voient votre annonce, l\'adresse précise est indispensable.',
      'Si vous préférez ne pas afficher l\'adresse publiquement, vous pouvez choisir de la masquer et d\'afficher uniquement une zone approximative sur la carte.',
      'La carte Terrimo géolocalise automatiquement votre bien dès la saisie — pas besoin de coordonnées GPS.',
    ],
    tip: null,
  },
  {
    num: '03',
    icon: '💶',
    title: 'Affichez un prix cohérent avec le marché',
    bullets: [
      'Un prix trop élevé allonge considérablement les délais de vente ou de location. Les acheteurs du Bassin connaissent bien les prix locaux.',
      'En cas de doute, utilisez notre outil d\'estimation gratuit basé sur les données DVF officielles.',
    ],
    tip: {
      icon: '📊',
      text: null,
      cta: { label: 'Estimer mon bien gratuitement →', href: '/evaluer' },
    },
  },
  {
    num: '04',
    icon: '📝',
    title: 'Décrivez votre bien en détail',
    bullets: [
      'Renseignez toutes les caractéristiques mesurables : nombre de pièces, surface, salles de bain, DPE, année de construction…',
      'Mentionnez les équipements qui font la différence sur le Bassin : piscine, garage, terrasse, vue, proximi té plage ou port.',
      'Mettez en avant les atouts non visibles sur les photos : calme, ensoleillement, commodités à pied, accès direct au bassin.',
      'Une description complète et honnête génère en moyenne 3× plus de contacts sérieux.',
    ],
    tip: null,
  },
];

const AVANTAGES = [
  {
    icon: '🗺️',
    title: 'Garantie de visibilité',
    desc: 'Vos annonces sont localisées sur la carte interactive Terrimo et visitées par des milliers d\'utilisateurs chaque mois, ce qui vous permet de vendre ou louer plus rapidement.',
  },
  {
    icon: '🔒',
    title: 'Espace privé de gestion',
    desc: 'Accédez à votre tableau de bord personnel pour modifier votre annonce, consulter les contacts reçus et suivre les statistiques de vues.',
  },
  {
    icon: '🔔',
    title: 'Alertes personnalisées',
    desc: 'Les acheteurs et locataires configurent des alertes sur mesure et reçoivent vos nouvelles annonces en temps réel — votre bien leur arrive directement.',
  },
  {
    icon: '🆓',
    title: 'Gratuit pour les particuliers',
    desc: 'La publication d\'une annonce est entièrement gratuite. Aucune commission, aucun abonnement requis pour déposer et gérer votre bien.',
  },
];

/* ─── Page ───────────────────────────────────────────────── */

export default function DeposerAnnoncePage() {
  return (
    <div
      style={{
        background: '#0a1628',
        minHeight: 'calc(100dvh - 68px)',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '72px 24px 56px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            marginBottom: 20,
            padding: '4px 14px',
            background: 'rgba(56,189,248,.12)',
            border: '1px solid rgba(56,189,248,.3)',
            borderRadius: 20,
            fontSize: 13,
            color: '#7dd3fc',
          }}
        >
          📝 Particuliers · Dépôt d&apos;annonce gratuit
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 18,
            letterSpacing: '-0.02em',
          }}
        >
          Comment déposer une annonce<br />
          <span style={{ color: '#38bdf8' }}>sur Terrimo</span>
        </h1>

        <p
          style={{
            fontSize: '1.0625rem',
            color: 'rgba(255,255,255,.6)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 12px',
          }}
        >
          Vos annonces sont <strong style={{ color: 'white' }}>gratuites</strong> et localisées sur la carte
          Terrimo. Accédez à un espace privé pour gérer votre annonce et les contacts reçus.
        </p>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 40 }}>
          Gratuit · Sans engagement · Visible sur la carte Bassin d&apos;Arcachon
        </p>

        <Link
          href="/pro/connexion"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 32px',
            borderRadius: 14,
            fontSize: '1rem',
            fontWeight: 800,
            background: '#38bdf8',
            color: '#0a1626',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(56,189,248,.3)',
          }}
        >
          Déposer mon annonce →
        </Link>
      </section>

      {/* ── 4 Étapes clés ────────────────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            marginBottom: 12,
          }}
        >
          Les 4 étapes pour vendre ou louer plus vite
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,.45)',
            fontSize: 14,
            marginBottom: 40,
          }}
        >
          Suivez ces conseils pour maximiser vos chances de trouver preneur rapidement.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {ETAPES.map((etape) => (
            <div
              key={etape.num}
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 20,
                padding: '28px 28px 24px',
              }}
            >
              {/* En-tête étape */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(56,189,248,.15)',
                    border: '1px solid rgba(56,189,248,.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}
                >
                  {etape.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#38bdf8',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Étape {etape.num}
                  </div>
                  <h3
                    style={{ fontWeight: 800, fontSize: '1.0625rem', lineHeight: 1.35, margin: 0 }}
                  >
                    {etape.title}
                  </h3>
                </div>
              </div>

              {/* Bullets */}
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: etape.tip ? 16 : 0,
                }}
              >
                {etape.bullets.map((b, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 10,
                      fontSize: 14,
                      color: 'rgba(255,255,255,.6)',
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: 2 }}>›</span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Tip / CTA optionnel */}
              {etape.tip && (
                <div
                  style={{
                    background: 'rgba(56,189,248,.07)',
                    border: '1px solid rgba(56,189,248,.15)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,.55)',
                    lineHeight: 1.6,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {etape.tip.icon && (
                    <span style={{ fontSize: '1.1rem' }}>{etape.tip.icon}</span>
                  )}
                  {etape.tip.text && <span>{etape.tip.text}</span>}
                  {etape.tip.cta && (
                    <Link
                      href={etape.tip.cta.href}
                      style={{
                        color: '#38bdf8',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {etape.tip.cta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Avantages ────────────────────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            marginBottom: 36,
          }}
        >
          Avantages de la publication sur Terrimo
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {AVANTAGES.map((a) => (
            <div
              key={a.title}
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 18,
                padding: '22px 20px',
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: 12 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.65 }}>
                {a.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services complémentaires ──────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            marginBottom: 24,
          }}
        >
          Pour aller plus loin
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

          {/* Agences */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,.1), rgba(56,189,248,.04))',
              border: '1px solid rgba(56,189,248,.2)',
              borderRadius: 20,
              padding: '28px 24px',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 14 }}>🏢</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
              Vous recommandons une agence
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.55)',
                lineHeight: 1.65,
                marginBottom: 20,
              }}
            >
              Pour un service personnalisé, un professionnel de l&apos;immobilier étudiera votre bien,
              le valorisera et s&apos;adaptera à votre situation. Idéal pour vendre au meilleur prix
              sur le Bassin.
            </p>
            <Link
              href="/agences"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: 'rgba(56,189,248,.2)',
                border: '1px solid rgba(56,189,248,.35)',
                color: '#7dd3fc',
                textDecoration: 'none',
              }}
            >
              Voir les agences du Bassin →
            </Link>
          </div>

          {/* Pros */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,.12), rgba(99,102,241,.04))',
              border: '1px solid rgba(99,102,241,.25)',
              borderRadius: 20,
              padding: '28px 24px',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 14 }}>🏗️</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
              Vous êtes un professionnel de l&apos;immobilier ?
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.55)',
                lineHeight: 1.65,
                marginBottom: 20,
              }}
            >
              Nous proposons des offres adaptées aux agences, conciergeries et indépendants : diffusion
              de portefeuille, captation de mandats, accès aux acquéreurs qualifiés et outils de gestion.
            </p>
            <Link
              href="/pro/rejoindre"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: 'rgba(99,102,241,.2)',
                border: '1px solid rgba(99,102,241,.35)',
                color: '#a5b4fc',
                textDecoration: 'none',
              }}
            >
              Découvrir nos avantages pour les pros →
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
