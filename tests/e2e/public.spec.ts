import { expect, test } from "@playwright/test";

const routes = ["/", "/coiffures", "/produits", "/services", "/rendez-vous", "/a-propos", "/contact", "/confidentialite", "/mentions-legales"];

test("toutes les pages publiques sont accessibles et structurées", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => { if (!error.message.includes("/__nextjs_original-stack-frames")) errors.push(error.message); });
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBe(true);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, `${route} déborde horizontalement`).toBe(false);
  }
  expect(errors).toEqual([]);
});

test("le catalogue affiche des visuels uniques et un CTA WhatsApp prérempli", async ({ page }) => {
  await page.goto("/produits");
  const images = await page.locator("article img").evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).currentSrc));
  expect(new Set(images).size).toBe(images.length);
  const cta = page.getByRole("link", { name: "Demander ce produit sur WhatsApp" }).first();
  await expect(cta).toHaveAttribute("href", /wa\.me\/33745238006/);
  expect(decodeURIComponent((await cta.getAttribute("href")) || "")).toContain("Ampoules, soin intensif");
});

test("la page 404 est explicite", async ({ page }) => {
  const response = await page.goto("/page-inexistante-production");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Cette page n’existe pas." })).toBeVisible();
});
