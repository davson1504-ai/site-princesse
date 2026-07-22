import { z } from "zod";
import { availabilityConfig } from "@/config/availability";
import { readLocalDates } from "@/lib/booking/local-availability";
import { parisDateKey } from "@/lib/booking/date";
import { validateBusinessSlot } from "@/lib/booking/availability";
import { hasConflict, serviceDetails } from "@/lib/database/appointments";
import { getPrisma } from "@/lib/database/prisma";

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), service: z.string().min(1) });
type DateConfig = { startMinutes: number; endMinutes: number; slotIntervalMinutes: number; breakStartMinutes: number | null; breakEndMinutes: number | null };
const pad = (value: number) => value.toString().padStart(2, "0");

async function generateSlots(date: string, service: { durationMinutes: number }, config: DateConfig) {
  const slots: string[] = [];
  for (let cursor = config.startMinutes; cursor < config.endMinutes; cursor += config.slotIntervalMinutes) {
    if (config.breakStartMinutes != null && config.breakEndMinutes != null && cursor < config.breakEndMinutes && cursor + service.durationMinutes > config.breakStartMinutes) continue;
    const time = `${pad(Math.floor(cursor / 60))}:${pad(cursor % 60)}`;
    if (!validateBusinessSlot(date, time, service.durationMinutes).valid) continue;
    if (!(await hasConflict(date, time, service.durationMinutes))) slots.push(time);
  }
  return slots;
}

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const db = getPrisma();
  if (!params.date) {
    const service = serviceDetails(params.service || "tresses");
    if (!service) return Response.json({ error: "Service introuvable" }, { status: 404 });
    const todayKey = parisDateKey();
    const rows = db ? await db.bookingAvailabilityDate.findMany({ where: { isPublished: true, date: { gte: new Date(`${todayKey}T00:00:00.000Z`) } }, orderBy: { date: "asc" }, take: 7 }) : (await readLocalDates()).filter(row => row.isPublished && row.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);
    const states = await Promise.all(rows.map(async row => { const date = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date; return { date, full: !(await generateSlots(date, service, row)).length }; }));
    return Response.json({ dates: states.filter(state => !state.full).map(state => state.date), fullDates: states.filter(state => state.full).map(state => state.date), timezone: availabilityConfig.timezone });
  }

  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return Response.json({ error: "Date ou service invalide" }, { status: 400 });
  const service = serviceDetails(parsed.data.service);
  if (!service) return Response.json({ error: "Service introuvable" }, { status: 404 });
  const row = db ? await db.bookingAvailabilityDate.findUnique({ where: { date: new Date(`${parsed.data.date}T00:00:00.000Z`) } }) : (await readLocalDates()).find(item => item.date === parsed.data.date);
  if (!row?.isPublished) return Response.json({ error: "Cette date n’est pas publiée", slots: [] }, { status: 409 });
  const slots = await generateSlots(parsed.data.date, service, row);
  return Response.json({ date: parsed.data.date, service: service.id, timezone: availabilityConfig.timezone, slots, full: !slots.length });
}
