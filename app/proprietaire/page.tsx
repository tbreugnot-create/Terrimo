import { redirect } from 'next/navigation';

// Page remplacée par le menu Propriétaires dans la nav → /evaluer
export default function ProprietairePage() {
  redirect('/evaluer');
}
