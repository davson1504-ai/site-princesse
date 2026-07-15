import { appointmentSchema, makeReference } from "@/lib/validation/appointment";
import { createAppointment, hasConflict, updateAppointment } from "@/lib/database/appointments";
import { notifyPrincesse } from "@/lib/notifications/send";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`booking:${ip}`, 5, 10 * 60_000)) return Response.json({ error: "Trop de demandes. Réessayez dans quelques minutes." }, { status: 429 });
  const origin = req.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  if (origin && expected && new URL(origin).host !== new URL(expected).host) return Response.json({ error: "Origine non autorisée" }, { status: 403 });
  try {
    const parsed = appointmentSchema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const data = parsed.data;
    if (await hasConflict(data.appointmentDate, data.appointmentTime)) return Response.json({ error: "Ce créneau vient d’être réservé. Choisissez une autre heure." }, { status: 409 });
    const appointment = await createAppointment(data, makeReference());
    const notification = await notifyPrincesse(appointment);
    if (notification.errors.length) await updateAppointment(appointment.reference, appointment.status, notification.errors);
    return Response.json({ reference: appointment.reference, whatsappUrl: notification.whatsappUrl, notificationMode: notification.whatsappSent ? "automatic" : "manual", emailSent: notification.emailSent }, { status: 201 });
  } catch (error) {
    console.error("appointment.create.failed", error);
    return Response.json({ error: "La demande n’a pas pu être enregistrée." }, { status: 500 });
  }
}
