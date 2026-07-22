import { appointmentSchema, makeReference } from "@/lib/validation/appointment";
import { AppointmentConflictError, createAppointment, hasConflict, serviceDetails, updateAppointment } from "@/lib/database/appointments";
import { validateBusinessSlot } from "@/lib/booking/availability";
import { notifyPrincesse } from "@/lib/notifications/send";
import { rateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { isPublishedBookingDate } from "@/lib/booking/published-dates";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!(await rateLimit(`booking:${ip}`, 5, 10 * 60_000))) return Response.json({ error: "Trop de demandes. Réessayez dans quelques minutes." }, { status: 429 });
  const origin = req.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  const allowedHosts = new Set([expected ? new URL(expected).host : null, process.env.VERCEL_URL].filter(Boolean));
  if (process.env.NODE_ENV === "production" && origin && !allowedHosts.has(new URL(origin).host)) return Response.json({ error: "Origine non autorisée" }, { status: 403 });
  try {
    const parsed = appointmentSchema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const data = parsed.data;
    if (!(await verifyTurnstile(data.turnstileToken, ip))) return Response.json({ error: "La vérification anti-spam a échoué. Rechargez la page puis réessayez." }, { status: 400 });
    const service = serviceDetails(data.serviceId);
    if (!service) return Response.json({ error: "Le service sélectionné n'existe pas." }, { status: 400 });
    if(!(await isPublishedBookingDate(data.appointmentDate)))return Response.json({error:"Cette date n’est pas disponible."},{status:409});
    const slot = validateBusinessSlot(data.appointmentDate, data.appointmentTime, service.durationMinutes);
    if (!slot.valid) return Response.json({ error: slot.reason }, { status: 400 });
    if (await hasConflict(data.appointmentDate, data.appointmentTime, service.durationMinutes)) return Response.json({ error: "Ce créneau vient d’être réservé. Choisissez une autre heure." }, { status: 409 });
    const appointment = await createAppointment(data, makeReference());
    const notification = await notifyPrincesse(appointment);
    if (notification.errors.length) await updateAppointment(appointment.reference, appointment.status, notification.errors);
    return Response.json({ reference: appointment.reference, whatsappUrl: notification.whatsappUrl, notificationMode: notification.whatsappSent ? "automatic" : "manual", emailSent: notification.emailSent }, { status: 201 });
  } catch (error) {
    if (error instanceof AppointmentConflictError) return Response.json({ error: "Ce créneau vient d’être réservé. Choisissez une autre heure." }, { status: 409 });
    console.error("appointment.create.failed", { kind: error instanceof Error ? error.name : "unknown" });
    return Response.json({ error: "La demande n’a pas pu être enregistrée." }, { status: 500 });
  }
}
