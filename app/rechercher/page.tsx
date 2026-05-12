import { redirect } from 'next/navigation';

// Page remplacée par /acquereur (mandat de recherche)
export default function RechercherPage() {
  redirect('/acquereur');
}
