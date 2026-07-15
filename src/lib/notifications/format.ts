import type { AppointmentRecord } from "@/types/appointment";
import { hairstyles, services } from "@/data/site";
export function formatAppointmentMessage(a:AppointmentRecord){const service=services.find(x=>x.id===a.serviceId)?.name||a.serviceId;const style=hairstyles.find(x=>x.id===a.hairstyleId)?.name||a.hairstyleId||"Non précisée";return `Nouveau rendez-vous — Princesse Coiffure\n\nRéférence : ${a.reference}\nCliente : ${a.customerName}\nTéléphone : ${a.phone}\nWhatsApp : ${a.whatsapp}\nEmail : ${a.email||"Non renseigné"}\nService : ${service}\nCoiffure : ${style}\nDate : ${a.appointmentDate}\nHeure : ${a.appointmentTime}\nLocalisation : ${a.location}\nType : ${a.appointmentType}\nContact préféré : ${a.preferredContactMethod}\nMessage : ${a.message||"—"}`;}

export function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : "";
}
