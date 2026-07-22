import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { hairstyles } from "@/data/site";
import { getPrisma } from "@/lib/database/prisma";

export default async function Page() {
  const db = getPrisma();
  const hairstyleOptions = db ? (await db.hairstyle.findMany({ where: { isActive: true }, orderBy: [{ isFeatured: "desc" }, { name: "asc" }], select: { slug: true, name: true } })).map(item => ({ id: item.slug, name: item.name })) : hairstyles.map(item => ({ id: item.id, name: item.name }));
  return <div className="mx-auto max-w-3xl px-5 py-16"><p className="text-xs uppercase tracking-[.25em] text-[#9a624d]">Réservation</p><h1 className="mt-2 font-serif text-5xl">Votre prochain rendez-vous</h1><p className="my-8 text-black/60">La demande sera enregistrée. Elle reste à confirmer par Beauty Haïr by Nao.</p><Suspense><BookingForm hairstyleOptions={hairstyleOptions} /></Suspense></div>;
}
