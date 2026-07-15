import { addMinutes, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { availabilityConfig } from "@/config/availability";

const minutes = (value: string) => { const [hours, mins] = value.split(":").map(Number); return hours * 60 + mins; };

export function appointmentRange(date: string, time: string, durationMinutes: number, timezone = availabilityConfig.timezone) {
  const start = fromZonedTime(`${date}T${time}:00`, timezone);
  return { start, end: addMinutes(start, durationMinutes + availabilityConfig.bufferMinutes) };
}

export function validateBusinessSlot(date: string, time: string, durationMinutes: number, now = new Date()) {
  const { start, end } = appointmentRange(date, time, durationMinutes);
  if (Number.isNaN(start.getTime())) return { valid: false, reason: "Date ou heure invalide" } as const;
  if (isBefore(start, addMinutes(now, availabilityConfig.minimumLeadHours * 60))) return { valid: false, reason: "Ce créneau est trop proche ou déjà passé" } as const;
  const localStart = toZonedTime(start, availabilityConfig.timezone);
  const localEnd = toZonedTime(end, availabilityConfig.timezone);
  if (!availabilityConfig.openDays.includes(localStart.getDay() as 1 | 2 | 3 | 4 | 5 | 6)) return { valid: false, reason: "Princesse ne reçoit pas ce jour-là" } as const;
  const startMinutes = localStart.getHours() * 60 + localStart.getMinutes();
  const endMinutes = localEnd.getHours() * 60 + localEnd.getMinutes();
  if (startMinutes < minutes(availabilityConfig.openingTime) || endMinutes > minutes(availabilityConfig.closingTime)) return { valid: false, reason: "Ce créneau est en dehors des horaires d'ouverture" } as const;
  if (availabilityConfig.breaks.some((pause) => startMinutes < minutes(pause.end) && endMinutes > minutes(pause.start))) return { valid: false, reason: "Ce créneau chevauche une pause" } as const;
  return { valid: true, start, end } as const;
}
