import { getPrisma } from "@/lib/database/prisma";
import { MAX_ACTIVE_BOOKING_DATES } from "@/data/site";
import { readLocalDates } from "./local-availability";
import { parisDateKey } from "./date";
export async function isPublishedBookingDate(date: string) {
  const db = getPrisma();
  if (!db) {
    const rows = await readLocalDates();
    return Boolean(rows.find((x) => x.date === date)?.isPublished);
  }
  const row = await db.bookingAvailabilityDate.findUnique({
    where: { date: new Date(`${date}T00:00:00.000Z`) },
  });
  return Boolean(row?.isPublished);
}
export function assertFutureDate(date: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < parisDateKey(now))
    throw new Error("Une date passée ne peut pas être publiée");
}
export function assertPublicationLimit(count: number) {
  if (count >= MAX_ACTIVE_BOOKING_DATES)
    throw new Error(
      `Maximum de ${MAX_ACTIVE_BOOKING_DATES} dates publiées atteint`,
    );
}
