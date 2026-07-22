import { z } from "zod";
import { publishLocalDate, readLocalDates } from "@/lib/booking/local-availability";
import { assertFutureDate, assertPublicationLimit } from "@/lib/booking/published-dates";
import { parisDateKey } from "@/lib/booking/date";
import { getPrisma } from "@/lib/database/prisma";
import { isAdmin } from "@/lib/security/auth";

const schema = z.object({ date: z.iso.date(), startMinutes: z.number().int().min(0).max(1439).default(540), endMinutes: z.number().int().min(1).max(1440).default(1080), breakStartMinutes: z.number().int().min(0).max(1439).nullable().optional(), breakEndMinutes: z.number().int().min(1).max(1440).nullable().optional(), slotIntervalMinutes: z.number().int().min(15).max(240).default(30), note: z.string().max(500).nullable().optional() }).refine(value => value.startMinutes < value.endMinutes, "L’heure de fin doit suivre l’heure de début").refine(value => (value.breakStartMinutes == null) === (value.breakEndMinutes == null), "La pause doit avoir un début et une fin").refine(value => value.breakStartMinutes == null || (value.breakStartMinutes < value.breakEndMinutes! && value.breakStartMinutes >= value.startMinutes && value.breakEndMinutes! <= value.endMinutes), "La pause doit être comprise dans la plage d’ouverture");

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const db = getPrisma();
  if (!db) return Response.json({ dates: await readLocalDates() });
  return Response.json({ dates: await db.bookingAvailabilityDate.findMany({ orderBy: { date: "asc" } }) });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Date invalide" }, { status: 400 });
    const body = parsed.data;
    assertFutureDate(body.date);
    const db = getPrisma();
    if (!db) return Response.json(await publishLocalDate(body.date), { status: 201 });
    const result = await db.$transaction(async tx => {
      const date = new Date(`${body.date}T00:00:00.000Z`);
      const existing = await tx.bookingAvailabilityDate.findUnique({ where: { date } });
      if (!existing?.isPublished) {
        const count = await tx.bookingAvailabilityDate.count({ where: { isPublished: true, date: { gte: new Date(`${parisDateKey()}T00:00:00.000Z`) } } });
        assertPublicationLimit(count);
      }
      const row = await tx.bookingAvailabilityDate.upsert({ where: { date }, update: { ...body, date: undefined, isPublished: true }, create: { ...body, date, isPublished: true } });
      await tx.adminAuditLog.create({ data: { action: "AVAILABILITY_PUBLISHED", targetRef: row.id, metadata: { date: body.date } } });
      return row;
    }, { isolationLevel: "Serializable" });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Date invalide" }, { status: 409 });
  }
}
