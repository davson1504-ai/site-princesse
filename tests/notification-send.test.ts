import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppointmentRecord } from "@/types/appointment";

const sendEmail = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));
vi.mock("@/lib/database/prisma", () => ({ getPrisma: () => null }));

const appointment: AppointmentRecord = {
  id: "appointment-1",
  reference: "PC-NOTIFY",
  customerName: "Cliente Test",
  phone: "+33700000001",
  whatsapp: "+33700000001",
  email: "cliente@example.com",
  serviceId: "tresses",
  hairstyleId: "couronne",
  appointmentDate: "2099-01-15",
  appointmentTime: "10:00",
  location: "Paris",
  appointmentType: "salon",
  preferredContactMethod: "whatsapp",
  message: "Test sans envoi réel",
  status: "PENDING",
  createdAt: "2099-01-01T00:00:00.000Z",
  updatedAt: "2099-01-01T00:00:00.000Z",
};

const keys = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "PRINCESSE_EMAIL",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_TEMPLATE_NAME",
  "PRINCESSE_WHATSAPP",
] as const;

describe("envoi des notifications", () => {
  beforeEach(() => {
    vi.resetModules();
    sendEmail.mockReset();
    vi.unstubAllGlobals();
    for (const key of keys) delete process.env[key];
  });

  afterEach(() => vi.unstubAllGlobals());

  it("ne contacte aucun fournisseur désactivé et propose wa.me", async () => {
    process.env.PRINCESSE_WHATSAPP = "+33745238006";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { notifyPrincesse } = await import("@/lib/notifications/send");

    const result = await notifyPrincesse(appointment);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.whatsappUrl).toMatch(/^https:\/\/wa\.me\/33745238006\?text=/);
    expect(result.emailSent).toBe(false);
    expect(result.whatsappSent).toBe(false);
  });

  it("envoie les deux emails et le template Meta uniquement avec la configuration complète", async () => {
    Object.assign(process.env, {
      RESEND_API_KEY: "test-resend",
      EMAIL_FROM: "site@example.com",
      PRINCESSE_EMAIL: "princesse@example.com",
      PRINCESSE_WHATSAPP: "+33745238006",
      WHATSAPP_PHONE_NUMBER_ID: "phone-id",
      WHATSAPP_ACCESS_TOKEN: "test-token",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "business-id",
      WHATSAPP_TEMPLATE_NAME: "appointment_template",
    });
    sendEmail
      .mockResolvedValueOnce({ data: { id: "email-admin" }, error: null })
      .mockResolvedValueOnce({ data: { id: "email-customer" }, error: null });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: "wa-provider-id" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { notifyPrincesse } = await import("@/lib/notifications/send");

    const result = await notifyPrincesse(appointment);

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail.mock.calls[0][0]).toMatchObject({ to: "princesse@example.com" });
    expect(sendEmail.mock.calls[1][0]).toMatchObject({ to: "cliente@example.com" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const metaRequest = fetchMock.mock.calls[0][1] as RequestInit;
    const metaBody = JSON.parse(String(metaRequest.body));
    expect(metaBody).toMatchObject({ to: "33745238006", type: "template" });
    expect(result).toMatchObject({ emailSent: true, customerEmailSent: true, whatsappSent: true, errors: [] });
  });

  it("conserve un résultat exploitable lorsque Resend et Meta échouent", async () => {
    Object.assign(process.env, {
      RESEND_API_KEY: "test-resend",
      EMAIL_FROM: "site@example.com",
      PRINCESSE_EMAIL: "princesse@example.com",
      PRINCESSE_WHATSAPP: "+33745238006",
      WHATSAPP_PHONE_NUMBER_ID: "phone-id",
      WHATSAPP_ACCESS_TOKEN: "test-token",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "business-id",
      WHATSAPP_TEMPLATE_NAME: "appointment_template",
    });
    sendEmail.mockRejectedValue(new Error("provider unavailable\nsecret detail"));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    const { notifyPrincesse } = await import("@/lib/notifications/send");

    const result = await notifyPrincesse(appointment);

    expect(result).toBeDefined();
    expect(result.emailSent).toBe(false);
    expect(result.customerEmailSent).toBe(false);
    expect(result.whatsappSent).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(result.errors.join(" ")).not.toContain("\n");
    expect(result.whatsappUrl).toContain("wa.me/33745238006");
  });
});
