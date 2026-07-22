import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { getPrisma } from "@/lib/database/prisma";
import { isAdmin } from "@/lib/security/auth";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function Page() {
  if (!(await isAdmin())) {
    return <div className="mx-auto max-w-4xl px-5 py-16"><p className="text-xs uppercase tracking-widest">Administration sécurisée</p><h1 className="mt-2 font-serif text-5xl">Beauty Haïr by Nao</h1><p className="mt-4 text-black/60">Connectez-vous pour gérer l’activité.</p><LoginForm /></div>;
  }

  const db = getPrisma();
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
  const [publishedDates, upcoming, pending, activeProducts, activeHairstyles, byDate] = db ? await Promise.all([
    db.bookingAvailabilityDate.count({ where: { isPublished: true, date: { gte: today } } }),
    db.appointment.count({ where: { appointmentDate: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.appointment.count({ where: { status: "PENDING" } }),
    db.product.count({ where: { active: true } }),
    db.hairstyle.count({ where: { isActive: true } }),
    db.appointment.groupBy({ by: ["appointmentDate"], where: { appointmentDate: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } }, _count: { _all: true }, orderBy: { appointmentDate: "asc" }, take: 7 }),
  ]) : [0, 0, 0, 0, 0, []];

  const stats = [
    ["Dates publiées", `${publishedDates} / 7`, "/admin/disponibilites"],
    ["Rendez-vous à venir", upcoming, "/admin/rendez-vous"],
    ["Demandes en attente", pending, "/admin/rendez-vous"],
    ["Produits actifs", activeProducts, "/admin/produits"],
    ["Coiffures actives", activeHairstyles, "/admin/coiffures"],
  ] as const;

  return <main className="mx-auto max-w-6xl px-5 py-12"><h1 className="font-serif text-4xl">Tableau de bord</h1><p className="mt-2 text-black/60">Vue synthétique de l’activité Beauty Haïr by Nao.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{stats.map(([label, value, href]) => <Link key={label} href={href} className="rounded-2xl bg-white p-5 shadow-sm"><span className="text-sm text-black/60">{label}</span><strong className="mt-2 block font-serif text-3xl">{value}</strong></Link>)}</div><section className="mt-10"><h2 className="font-serif text-3xl">Rendez-vous par date</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{byDate.map(row => <div key={row.appointmentDate.toISOString()} className="rounded-xl bg-white p-4"><strong>{row.appointmentDate.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}</strong><span className="block text-sm text-black/60">{row._count._all} rendez-vous actif{row._count._all > 1 ? "s" : ""}</span></div>)}{!byDate.length && <p className="text-sm text-black/55">Aucun rendez-vous à venir.</p>}</div></section></main>;
}
