import { z } from "zod";
import { isAdmin } from "@/lib/security/auth";
import { getPrisma } from "@/lib/database/prisma";
import {
  assertFutureDate,
  assertPublicationLimit,
} from "@/lib/booking/published-dates";
import { parisDateKey } from "@/lib/booking/date";
import { patchLocalDate } from "@/lib/booking/local-availability";
const schema = z.object({
  isPublished: z.boolean().optional(),
  startMinutes: z.number().int().min(0).max(1439).optional(),
  endMinutes: z.number().int().min(1).max(1440).optional(),
  breakStartMinutes: z.number().int().min(0).max(1439).nullable().optional(),
  breakEndMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  slotIntervalMinutes: z.number().int().min(15).max(240).optional(),
  note: z.string().max(500).nullable().optional(),
});
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Configuration invalide" }, { status: 400 });
  const { id } = await params;
  const db = getPrisma();
  try {
    if (!db) return Response.json(await patchLocalDate(id, parsed.data));
    const row = await db.$transaction(
      async (tx) => {
        const existing = await tx.bookingAvailabilityDate.findUniqueOrThrow({
          where: { id },
        });
        if (parsed.data.isPublished && !existing.isPublished) {
          assertFutureDate(existing.date.toISOString().slice(0, 10));
          const count = await tx.bookingAvailabilityDate.count({
            where: {
              isPublished: true,
              date: { gte: new Date(`${parisDateKey()}T00:00:00.000Z`) },
            },
          });
          assertPublicationLimit(count);
        }
        const updated = await tx.bookingAvailabilityDate.update({
          where: { id },
          data: parsed.data,
        });
        if (updated.startMinutes >= updated.endMinutes)
          throw new Error("L’heure de fin doit suivre l’heure de début");
        if (
          (updated.breakStartMinutes == null) !==
          (updated.breakEndMinutes == null)
        )
          throw new Error("La pause doit avoir un début et une fin");
        if (
          updated.breakStartMinutes != null &&
          updated.breakEndMinutes != null &&
          (updated.breakStartMinutes < updated.startMinutes ||
            updated.breakEndMinutes > updated.endMinutes ||
            updated.breakStartMinutes >= updated.breakEndMinutes)
        )
          throw new Error("La pause doit être comprise dans la plage d’ouverture");
        await tx.adminAuditLog.create({
          data: {
            action: updated.isPublished
              ? "AVAILABILITY_UPDATED"
              : "AVAILABILITY_UNPUBLISHED",
            targetRef: id,
            metadata: { fields: Object.keys(parsed.data) },
          },
        });
        return updated;
      },
      { isolationLevel: "Serializable" },
    );
    return Response.json(row);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Modification impossible",
      },
      { status: 409 },
    );
  }
}
