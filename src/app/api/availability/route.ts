import { z } from "zod";
import { availabilityConfig } from "@/config/availability";
import { validateBusinessSlot } from "@/lib/booking/availability";
import { hasConflict, serviceDetails } from "@/lib/database/appointments";

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), service: z.string().min(1) });
const pad = (value: number) => value.toString().padStart(2, "0");

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Date ou service invalide" }, { status: 400 });
  const service = serviceDetails(parsed.data.service);
  if (!service) return Response.json({ error: "Service introuvable" }, { status: 404 });
  const [openHour, openMinute] = availabilityConfig.openingTime.split(":").map(Number);
  const [closeHour, closeMinute] = availabilityConfig.closingTime.split(":").map(Number);
  const slots: string[] = [];
  for (let cursor = openHour * 60 + openMinute; cursor < closeHour * 60 + closeMinute; cursor += availabilityConfig.slotStepMinutes) {
    const time = `${pad(Math.floor(cursor / 60))}:${pad(cursor % 60)}`;
    if (!validateBusinessSlot(parsed.data.date, time, service.durationMinutes).valid) continue;
    if (!(await hasConflict(parsed.data.date, time, service.durationMinutes))) slots.push(time);
  }
  return Response.json({ date: parsed.data.date, service: service.id, timezone: availabilityConfig.timezone, slots });
}
