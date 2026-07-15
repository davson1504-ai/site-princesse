export const appointmentStatuses = ["PENDING", "CONFIRMED", "REFUSED", "CANCELLED", "COMPLETED", "ARCHIVED"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];
export type AppointmentRecord = {
  id: string; reference: string; customerName: string; phone: string; whatsapp: string;
  email?: string; serviceId: string; hairstyleId?: string; appointmentDate: string;
  appointmentTime: string; appointmentDateTime?: string; endsAt?: string; timezone?: string; durationMinutes?: number; quotedPrice?: string; location: string; appointmentType: "salon" | "domicile";
  preferredContactMethod: "whatsapp" | "telephone" | "email"; message?: string;
  status: AppointmentStatus; notificationErrors?: string[]; createdAt: string; updatedAt: string;
};
