'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';

const TerrimoMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-indigo-600 text-lg">Terrimo</Link>
          <span className="text-xs text-gray-400 hidden sm:block">Immobilier · Bassin d'Arcachon</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/business" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block">
            Professionnels
          </Link>
          <Link href="/business" className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Rejoindre
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex">
        <Suspense>
          <TerrimoMap />
        </Suspense>
      </main>
    </div>
  );
}
