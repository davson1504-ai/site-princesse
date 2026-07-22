import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointment } from "@/lib/database/appointments";
import { formatEUR } from "@/lib/pricing";

export default async function Page({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<{ wa?: string }> }) {
  const { reference } = await params;
  const appointment = await getAppointment(reference);
  if (!appointment) notFound();
  const { wa } = await searchParams;
  return <div className="mx-auto max-w-2xl px-5 py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 text-2xl">✓</div><h1 className="mt-6 font-serif text-5xl">Demande enregistrée</h1><p className="mt-5">Référence : <strong>{reference}</strong></p><p className="mt-3 text-black/60">Rendez-vous demandé le {appointment.appointmentDate} à {appointment.appointmentTime}. Beauty Haïr by Nao doit encore confirmer ce créneau.</p>{appointment.braidSizeCode && <dl className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 rounded-2xl bg-white p-4 text-sm"><div><dt>Taille</dt><dd className="font-semibold">{appointment.braidSizeCode}</dd></div><div><dt>Longueur supérieure</dt><dd className="font-semibold">{appointment.extraLength ? "Oui" : "Non"}</dd></div><div><dt>Estimation</dt><dd className="font-semibold">{appointment.estimatedPriceCents == null ? "À confirmer" : `À partir de ${formatEUR(appointment.estimatedPriceCents)}`}</dd></div></dl>}{wa && <><a href={wa} target="_blank" rel="noreferrer" className="mt-8 inline-block rounded-full bg-[#1f8f55] px-6 py-3 text-white">Ouvrir WhatsApp et valider l’envoi</a><p className="mt-3 text-xs text-black/50">Ce bouton prépare le message ; il ne l’envoie pas automatiquement.</p></>}<br /><Link href="/" className="mt-6 inline-block underline">Retour à l’accueil</Link></div>;
}
