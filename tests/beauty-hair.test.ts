import { describe, expect, it } from "vitest";
import { MAX_ACTIVE_BOOKING_DATES, SITE_NAME } from "@/data/site";
import { assertFutureDate, assertPublicationLimit } from "@/lib/booking/published-dates";
import { parisDateKey } from "@/lib/booking/date";
import { braidPrices, estimateBraidPrice, formatEUR, productPrice } from "@/lib/pricing";
import { buildProductWhatsAppMessage } from "@/lib/products";

describe("Beauty Haïr by Nao", () => {
  it("centralise la marque", () => expect(SITE_NAME).toBe("Beauty Haïr by Nao"));

  it.each([
    ["XS", 11000],
    ["S", 9000],
    ["M", 7000],
    ["L", 5000],
  ] as const)("calcule le tarif %s", (code, expected) => {
    expect(braidPrices[code]).toBe(expected);
    expect(estimateBraidPrice(code)).toBe(expected);
    expect(estimateBraidPrice(code, true)).toBe(expected + 1000);
  });

  it("formate les euros en français et refuse les montants négatifs", () => {
    expect(formatEUR(7000)).toMatch(/70[,.\s]*00\s*€/);
    expect(() => formatEUR(-1)).toThrow(/négatif/);
  });

  it("affiche les états de prix produit", () => {
    expect(productPrice()).toBe("Prix à confirmer");
    expect(productPrice(1090, "VERIFY")).toMatch(/À vérifier.*10,90/);
  });

  it("construit le message WhatsApp produit avec référence et prix", () => {
    expect(buildProductWhatsAppMessage(SITE_NAME, { name: "Ampoules Aurodhea", code: "A101B", displayedPrice: "10,90 €" })).toContain("Ampoules Aurodhea (réf. A101B), affiché à 10,90 €");
  });

  it("accepte sept dates au maximum et refuse la huitième", () => {
    expect(MAX_ACTIVE_BOOKING_DATES).toBe(7);
    expect(() => assertPublicationLimit(6)).not.toThrow();
    expect(() => assertPublicationLimit(7)).toThrow(/Maximum/);
  });

  it("refuse une date passée et accepte une date future", () => {
    const now = new Date("2026-07-22T12:00:00.000Z");
    expect(() => assertFutureDate("2026-07-21", now)).toThrow(/passée/);
    expect(() => assertFutureDate("2026-07-23", now)).not.toThrow();
  });

  it("calcule le jour courant dans le fuseau Europe/Paris", () => {
    expect(parisDateKey(new Date("2026-07-22T22:30:00.000Z"))).toBe("2026-07-23");
    expect(parisDateKey(new Date("2026-01-22T22:30:00.000Z"))).toBe("2026-01-22");
  });
});
