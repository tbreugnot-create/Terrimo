import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terrimo pour les professionnels — Agences, Notaires, Diagnostiqueurs",
  description: "Rejoignez Terrimo et développez votre activité sur le Bassin d'Arcachon. Inscription gratuite, formules Pro et Premium.",
};

const PLANS = [
  {
    name: 'Gratuit',
    price: '0 €',
    period: '/mois',
    description: 'Pour démarrer',
    features: [
      'Fiche de base sur la carte',
      'Coordonnées de base',
      '3 biens max (agences)',
      'Visible sur la carte',
    ],
    cta: 'Revendiquer ma fiche gratuitement',
    ctaStyle: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '49 €',
    period: '/mois',
    description: 'Pour les actifs du bassin',
    features: [
      'Profil complet + toutes infos',
      'Lien vers votre site web',
      'Biens illimités',
      'Avis clients visibles',
      'Badge Pro',
    ],
    cta: 'Démarrer en Pro',
    ctaStyle: 'bg-indigo-600 text-white hover:bg-indigo-700',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '149 €',
    period: '/mois',
    description: 'Visibilité maximale',
    features: [
      'Mise en avant + badge "Recommandé"',
      'Position prioritaire sur la carte',
      'Statistiques de vues',
      'Support prioritaire',
      'Tout le plan Pro inclus',
    ],
    cta: 'Contacter l\'équipe',
    ctaStyle: 'bg-gray-900 text-white hover:bg-gray-800',
    highlight: false,
  },
];

const PROFESSIONS = [
  {
    emoji: '🏢',
    name: 'Agences immobilières',
    description: 'Gagnez en visibilité locale, recevez des mandats qualifiés directement depuis la carte.',
  },
  {
    emoji: '⚖️',
    name: 'Notaires',
    description: 'Apparaissez sur la carte lors de chaque transaction immobilière dans votre secteur.',
  },
  {
    emoji: '🔍',
    name: 'Diagnostiqueurs',
    description: 'Soyez recommandé dès qu\'un bien est mis en vente dans votre zone d\'intervention.',
  },
];

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-indigo-600 text-lg">← Terrimo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Terrimo pour les professionnels
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          Développez votre activité sur le Bassin d'Arcachon. Terrimo réunit acheteurs, vendeurs, et les professionnels de l'immobilier sur une seule carte.
        </p>
        <a
          href="#contact"
          className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Inscription gratuite
        </a>

        {/* Logos agences partenaires */}
        <div className="mt-12 text-sm text-gray-400 mb-4">Rejoignez les professionnels déjà présents sur la carte</div>
        <div className="flex flex-wrap justify-center gap-6 items-center text-gray-400 text-sm font-medium">
          {['Barnes', 'Cabinet Bedin', 'Century 21', 'Human Immobilier', 'Laforêt', 'Maxwell-Baynes Christie\'s', 'Michaël Zingraf'].map(name => (
            <span key={name} className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{name}</span>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '📍', step: '1', title: 'Revendiquez votre fiche', desc: 'Votre profil est déjà sur la carte — réclamez-le en quelques clics.' },
              { emoji: '✏️', step: '2', title: 'Complétez vos informations', desc: 'Ajoutez vos coordonnées, spécialités et lien vers votre site web.' },
              { emoji: '📈', step: '3', title: 'Recevez des contacts qualifiés', desc: 'Acheteurs et vendeurs vous trouvent directement sur la carte.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Étape {item.step}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qui peut rejoindre */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Qui peut rejoindre Terrimo ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROFESSIONS.map(p => (
            <div key={p.name} className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tarifs */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Une formule adaptée à votre activité</h2>
          <p className="text-center text-gray-500 mb-12">Démarrez gratuitement, évoluez à votre rythme.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl p-6 border-2 transition-all ${
                  plan.highlight ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-100'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-3">✨ Recommandé</div>
                )}
                <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-indigo-500">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`block text-center text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire contact */}
      <section id="contact" className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">Rejoindre Terrimo</h2>
        <p className="text-center text-gray-500 mb-8">Remplissez ce formulaire et nous vous recontactons sous 48h.</p>

        <form className="space-y-4 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner…</option>
              <option>Agence immobilière</option>
              <option>Notaire</option>
              <option>Diagnostiqueur</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de votre structure *</label>
            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
            <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formule souhaitée</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Gratuit</option>
              <option>Pro 49€/mois</option>
              <option>Premium 149€/mois</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Envoyer ma demande
          </button>
        </form>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 Terrimo · <Link href="/" className="hover:text-indigo-600">Retour à la carte</Link></p>
      </footer>
    </div>
  );
}
