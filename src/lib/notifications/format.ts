import { hairstyles, services, SITE_NAME } from "@/data/site";
import { formatEUR } from "@/lib/pricing";
import type { AppointmentRecord } from "@/types/appointment";

const legacyStyles: Record<string, string> = { couronne: "Couronne bohème", silk: "Silk lace", twists: "Twists naturels" };

export function formatAppointmentMessage(appointment: AppointmentRecord) {
  const selected = services.find(service => service.id === appointment.serviceId);
  const style = hairstyles.find(item => item.id === appointment.hairstyleId)?.name || legacyStyles[appointment.hairstyleId || ""] || appointment.hairstyleId || "Non précisée";
  const estimate = appointment.estimatedPriceCents == null ? "À confirmer" : `À partir de ${formatEUR(appointment.estimatedPriceCents)}`;
  return `Nouveau rendez-vous — ${SITE_NAME}\n\nRéférence : ${appointment.reference}\nCliente : ${appointment.customerName}\nTéléphone : ${appointment.phone}\nWhatsApp : ${appointment.whatsapp}\nEmail : ${appointment.email || "Non renseigné"}\nService : ${selected?.name || appointment.serviceId}\nCoiffure : ${style}\nTaille des tresses : ${appointment.braidSizeCode || "Non applicable"}\nLongueur supérieure : ${appointment.extraLength ? "Oui" : "Non"}\nEstimation : ${estimate}\nPrix indicatif : ${appointment.quotedPrice || selected?.price || "À confirmer"}\nDurée : ${selected?.duration || `${appointment.durationMinutes || "—"} minutes`}\nDate : ${appointment.appointmentDate}\nHeure : ${appointment.appointmentTime}\nLocalisation : ${appointment.location}\nType : ${appointment.appointmentType}\nContact préféré : ${appointment.preferredContactMethod}\nMessage : ${appointment.message || "—"}`;
}

export function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : "";
}
