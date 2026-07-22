import { redirect } from "next/navigation";
import { AvailabilityManager } from "@/components/admin/availability-manager";
import { readLocalDates } from "@/lib/booking/local-availability";
import { getPrisma } from "@/lib/database/prisma";
import { isAdmin } from "@/lib/security/auth";

export default async function Page() {
  if (!(await isAdmin())) redirect("/admin");
  const db = getPrisma();
  const rows = db ? (await db.bookingAvailabilityDate.findMany({ orderBy: { date: "asc" }, include: { _count: { select: { appointments: true } } } })).map(({ _count, ...row }) => ({ ...row, date: row.date.toISOString(), appointmentCount: _count.appointments })) : (await readLocalDates()).map(row => ({ ...row, appointmentCount: 0 }));
  return <div className="mx-auto max-w-6xl px-5 py-12"><h1 className="font-serif text-4xl">Disponibilités</h1><p className="mt-3 text-black/60">Publiez jusqu’à sept dates précises. Fuseau : Europe/Paris.</p><AvailabilityManager initial={rows} /></div>;
}
