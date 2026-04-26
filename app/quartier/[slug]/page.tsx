import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { COMMUNES, COMMUNE_BY_SLUG } from '@/lib/communes';
import DvfStats from '@/components/DvfStats';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const commune = COMMUNE_BY_SLUG[slug];
  if (!commune) return {};

  return {
    title: `Immobilier à ${commune.name} — Prix, transactions et quartiers | Terrimo`,
    description: `Découvrez le marché immobilier de ${commune.name} : prix au m², transactions DVF, agences locales. ${commune.tagline}`,
  };
}

export async function generateStaticParams() {
  return COMMUNES.map((c) => ({ slug: c.slug }));
}

export default async function QuartierPage({ params }: Props) {
  const { slug } = await params;
  const commune = COMMUNE_BY_SLUG[slug];

  if (!commune) notFound();

  const tierColors = {
    premium: 'bg-violet-100 text-violet-800',
    equilibre: 'bg-sky-100 text-sky-800',
    emergent: 'bg-emerald-100 text-emerald-800',
  };

  const similarCommunes = COMMUNES.filter(
    c => c.slug !== slug && c.tier === commune.tier
  ).slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-indigo-600 text-lg">Terrimo</Link>
          <Link
            href="/business"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Professionnels →
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierColors[commune.tier]}`}>
              {commune.tierEmoji} {commune.tierLabel}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Immobilier à {commune.name}
          </h1>
          <p className="text-lg text-gray-500">{commune.tagline}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <p className="text-gray-600 leading-relaxed text-base">{commune.description}</p>
            </div>

            {/* Stats DVF réelles */}
            <DvfStats dvfName={commune.dvfName} communeName={commune.name} />

            {/* CTA Estimer */}
            <div className="bg-indigo-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-1">
                Estimer votre bien à {commune.name}
              </h3>
              <p className="text-indigo-200 text-sm mb-4">
                Obtenez une estimation gratuite basée sur les données DVF réelles de {commune.name}. En 3 minutes.
              </p>
              <Link
                href={`/evaluer?commune=${slug}`}
                className="inline-block bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Estimer gratuitement →
              </Link>
            </div>

            {/* CTA carte */}
            <div className="border border-indigo-200 rounded-xl p-5">
              <h3 className="font-semibold text-base mb-1 text-gray-800">
                Explorer {commune.name} sur la carte
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                Agences, biens disponibles et transactions récentes sur notre carte interactive.
              </p>
              <Link
                href={`/?commune=${slug}`}
                className="inline-block text-indigo-600 font-semibold text-sm hover:underline"
              >
                Voir la carte →
              </Link>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-4">
            {/* Communes similaires */}
            {similarCommunes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Communes similaires
                </h3>
                <div className="space-y-2">
                  {similarCommunes.map(c => (
                    <Link
                      key={c.slug}
                      href={`/quartier/${c.slug}`}
                      className="block p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.tierEmoji}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{c.tagline}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Toutes les communes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Toutes les communes
              </h3>
              <div className="space-y-1">
                {COMMUNES.map(c => (
                  <Link
                    key={c.slug}
                    href={`/quartier/${c.slug}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      c.slug === slug
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {c.tierEmoji} {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-400">
        <p>© 2026 Terrimo · <Link href="/business" className="hover:text-indigo-600">Professionnels</Link> · <Link href="/contact" className="hover:text-indigo-600">Contact</Link></p>
      </footer>
    </div>
  );
}
