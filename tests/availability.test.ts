import { describe, expect, it } from "vitest";
import { appointmentRange, validateBusinessSlot } from "@/lib/booking/availability";

describe("disponibilités Europe/Paris", () => {
  it("respecte le changement heure hiver/été", () => {
    expect(appointmentRange("2027-01-15", "10:00", 60).start.toISOString()).toContain("T09:00:00.000Z");
    expect(appointmentRange("2027-07-15", "10:00", 60).start.toISOString()).toContain("T08:00:00.000Z");
  });
  it("refuse un créneau passé", () => expect(validateBusinessSlot("2020-01-15", "10:00", 60).valid).toBe(false));
  it("refuse le dimanche", () => expect(validateBusinessSlot("2027-01-17", "10:00", 60, new Date("2026-01-01")).valid).toBe(false));
  it("refuse la pause et la fermeture", () => {
    expect(validateBusinessSlot("2027-01-15", "12:30", 60, new Date("2026-01-01")).valid).toBe(false);
    expect(validateBusinessSlot("2027-01-15", "18:00", 120, new Date("2026-01-01")).valid).toBe(false);
  });
  it("tient compte des durées différentes", () => {
    expect(validateBusinessSlot("2027-01-15", "16:00", 90, new Date("2026-01-01")).valid).toBe(true);
    expect(validateBusinessSlot("2027-01-15", "16:00", 240, new Date("2026-01-01")).valid).toBe(false);
  });
});
