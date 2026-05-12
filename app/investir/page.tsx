import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Investissement locatif Bassin d'Arcachon — Rendement & LMNP | Terrimo",
  description: "Investir dans l'immobilier sur le Bassin d'Arcachon : prix d'achat DVF, rendement locatif brut/net, fiscalité LMNP saisonnier, simulation. Arcachon, Cap Ferret, La Teste.",
  alternates: { canonical: 'https://terrimo.homes/investir' },
  openGraph: {
    title: "Investissement locatif Bassin d'Arcachon | Terrimo",
    description: "Simulez le rendement de votre investissement locatif saisonnier sur le Bassin.",
    type: 'website', locale: 'fr_FR',
    siteName: "Terrimo — Bassin d'Arcachon",
    url: 'https://terrimo.homes/investir',
  },
};

const COMMUNES_DATA = [
  {
    commune: 'Arcachon',
    prix_m2: 7450,
    loyer_sem_hs: 3200,
    loyer_sem_hc: 900,
    semaines_hs: 10,
    semaines_hc: 20,
    taux_occup: '72%',
    tendance: '+8%',
    tendance_up: true,
  },
  {
    commune: 'Lège-Cap-Ferret',
    prix_m2: 9200,
    loyer_sem_hs: 4500,
    loyer_sem_hc: 1100,
    semaines_hs: 9,
    semaines_hc: 18,
    taux_occup: '68%',
    tendance: '+11%',
    tendance_up: true,
  },
  {
    commune: 'La Teste-de-Buch',
    prix_m2: 5600,
    loyer_sem_hs: 2200,
    loyer_sem_hc: 700,
    semaines_hs: 10,
    semaines_hc: 20,
    taux_occup: '65%',
    tendance: '+5%',
    tendance_up: true,
  },
  {
    commune: 'Andernos-les-Bains',
    prix_m2: 5300,
    loyer_sem_hs: 1800,
    loyer_sem_hc: 600,
    semaines_hs: 10,
    semaines_hc: 22,
    taux_occup: '60%',
    tendance: '+4%',
    tendance_up: true,
  },
  {
    commune: 'Gujan-Mestras',
    prix_m2: 5050,
    loyer_sem_hs: 1600,
    loyer_sem_hc: 550,
    semaines_hs: 9,
    semaines_hc: 20,
    taux_occup: '58%',
    tendance: '+3%',
    tendance_up: true,
  },
];

const AVANTAGES_LMNP = [
  { icon: '💶', title: 'Revenus non imposés', desc: 'En régime réel LMNP, les charges, amortissements et intérêts d\'emprunt effacent généralement l\'intégralité des revenus locatifs imposables.' },
  { icon: '📉', title: 'Récupération de TVA', desc: 'Sur les résidences de services neuves, récupération possible de 20% de TVA sur le prix d\'achat.' },
  { icon: '🔄', title: 'Amortissement du bien', desc: 'Le bien et le mobilier s\'amortissent comptablement — un avantage fiscal unique aux meublés non professionnels.' },
  { icon: '🏖️', title: 'Jouissance personnelle', desc: 'Possibilité de bloquer des semaines pour l\'usage personnel tout en bénéficiant du statut LMNP.' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Investissement locatif Bassin d'Arcachon — Rendement & LMNP",
  url: 'https://terrimo.homes/investir',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Terrimo', item: 'https://terrimo.homes' },
      { '@type': 'ListItem', position: 2, name: 'Investir', item: 'https://terrimo.homes/investir' },
    ],
  },
};

function fmtEur(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function InvestirPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1626 0%, #0c2240 60%, #0f1f3d 100%)',
          padding: '64px 20px 56px',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.4)', marginBottom: 24, display: 'flex', gap: 6 }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terrimo</Link>
              <span>›</span><span>Investir</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}>
              Investissement locatif<br />
              <span style={{ color: '#38bdf8' }}>Bassin d&apos;Arcachon</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.125rem', margin: '0 0 40px', maxWidth: 560, lineHeight: 1.6 }}>
              Rendements locatifs, prix DVF, fiscalité LMNP saisonnier — tout pour investir intelligemment sur le Bassin d&apos;Arcachon.
            </p>

            {/* KPIs clés */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { icon: '📈', label: 'Rendement brut moyen', value: '4–7%' },
                { icon: '☀️', label: 'Semaines louées / an', value: '28–35' },
                { icon: '🏖️', label: 'Taux occupation HS', value: '>90%' },
                { icon: '💶', label: 'Revenu net LMNP', value: 'souvent 0 impôt' },
              ].map(k => (
                <div key={k.label} style={{
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 16, padding: '18px',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{k.icon}</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white' }}>{k.value}</div>
                  <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 60px' }}>

          {/* Tableau rendements par commune */}
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Rendements estimés par commune
            </h2>
            <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: 24 }}>
              Basé sur les données DVF 2024 et les revenus Airbnb moyens constatés sur le Bassin.
            </p>

            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 0.8fr',
                gap: 8, padding: '12px 20px', background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0', fontSize: '.75rem', fontWeight: 700,
                color: '#64748b', letterSpacing: '.05em',
              }}>
                <div>COMMUNE</div>
                <div>PRIX m²</div>
                <div>☀️ HAUTE SAI.</div>
                <div>❄️ HORS-SAI.</div>
                <div>TENDANCE</div>
              </div>

              {COMMUNES_DATA.map((r, i) => {
                const revenu_annuel = r.loyer_sem_hs * r.semaines_hs + r.loyer_sem_hc * r.semaines_hc;
                const prix_100m2 = r.prix_m2 * 100;
                const rendement_brut = Math.round((revenu_annuel / prix_100m2) * 1000) / 10;
                return (
                  <div key={r.commune} style={{
                    display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 0.8fr',
                    gap: 8, padding: '16px 20px', alignItems: 'center',
                    borderBottom: i < COMMUNES_DATA.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem' }}>{r.commune}</div>
                      <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2 }}>
                        Rendement brut estimé : <strong style={{ color: '#6366f1' }}>{rendement_brut}%</strong>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {new Intl.NumberFormat('fr-FR').format(r.prix_m2)} €/m²
                    </div>
                    <div style={{ fontSize: '.875rem', color: '#374151' }}>
                      {fmtEur(r.loyer_sem_hs)}/sem.
                    </div>
                    <div style={{ fontSize: '.875rem', color: '#374151' }}>
                      {fmtEur(r.loyer_sem_hc)}/sem.
                    </div>
                    <div>
                      <span style={{
                        fontSize: '.75rem', fontWeight: 700,
                        color: r.tendance_up ? '#15803d' : '#dc2626',
                        background: r.tendance_up ? '#dcfce7' : '#fee2e2',
                        padding: '2px 8px', borderRadius: 20,
                      }}>
                        {r.tendance_up ? '↑' : '↓'}{r.tendance}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 12 }}>
              * Simulation sur 100 m² · Revenus Airbnb indicatifs 2024 · Sans charges ni fiscalité · Source prix : DVF data.gouv.fr
            </p>
          </section>

          {/* LMNP */}
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Fiscalité LMNP saisonnier
            </h2>
            <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: 24 }}>
              Le statut Loueur Meublé Non Professionnel est idéal pour les résidences secondaires du Bassin.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {AVANTAGES_LMNP.map(a => (
                <div key={a.title} style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px',
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: 12 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.9375rem', marginBottom: 8 }}>{a.title}</div>
                  <div style={{ fontSize: '.8125rem', color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', fontSize: '.8125rem', color: '#92400e' }}>
              ⚠️ La fiscalité immobilière est complexe et évolue régulièrement. Consultez un notaire ou un expert-comptable spécialisé avant toute décision d&apos;investissement.
            </div>
          </section>

          {/* CTAs */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, #0a1626, #0f2040)',
              borderRadius: 20, padding: '32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏡</div>
              <h3 style={{ fontWeight: 800, color: 'white', fontSize: '1.125rem', margin: '0 0 10px' }}>
                Estimer votre bien
              </h3>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.875rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                Prix d&apos;achat actuel ou valeur de votre bien existant — données DVF réelles.
              </p>
              <Link href="/evaluer" style={{
                display: 'inline-block', padding: '11px 24px', borderRadius: 12,
                background: '#38bdf8', color: '#0a1626', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
              }}>
                Estimer avec DVF →
              </Link>
            </div>

            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: 20, padding: '32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem', margin: '0 0 10px' }}>
                Déposer votre recherche
              </h3>
              <p style={{ color: '#64748b', fontSize: '.875rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                Décrivez votre cible d&apos;investissement. Les agences vous contactent si un bien correspond.
              </p>
              <Link href="/acquereur" style={{
                display: 'inline-block', padding: '11px 24px', borderRadius: 12,
                background: '#6366f1', color: 'white', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
              }}>
                Déposer ma recherche →
              </Link>
            </div>
          </section>

          {/* Lien off-market */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/off-market" style={{ fontSize: '.875rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
              🔒 Découvrir les biens off-market du Bassin →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
