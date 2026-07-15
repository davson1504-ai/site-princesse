import { test, expect } from "@playwright/test";

test("une cliente réserve puis Princesse voit la demande", async ({ page }, testInfo) => {
  const runOffset = 20 + (Math.floor(Date.now() / 1000) % 300);
  const offset = runOffset + (testInfo.project.name === "mobile" ? 1 : 0);
  const future = new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  const customer = `Cliente Test ${testInfo.project.name}`;
  await page.goto("/rendez-vous");
  await page.getByLabel("Nom complet").fill(customer);
  await page.getByLabel("Téléphone", { exact: true }).fill("+22890000001");
  await page.getByLabel("WhatsApp (format international)", { exact: true }).fill("+22890000001");
  await page.getByLabel("Service").selectOption("tresses");
  await page.getByLabel("Coiffure").selectOption("couronne");
  await page.getByLabel("Date").fill(future);
  await page.getByLabel("Heure").fill("11:30");
  await page.getByLabel("Localisation / adresse").fill("Lomé centre");
  await page.getByLabel("Lieu").selectOption("salon");
  await page.getByLabel("Contact préféré").selectOption("whatsapp");
  await page.getByLabel(/politique/).check();
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await page.waitForURL(/\/confirmation\//, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Demande enregistrée" })).toBeVisible({ timeout: 15_000 });
  await page.goto("/admin");
  await page.getByLabel("Mot de passe de Princesse").fill("princesse-local");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText(customer).first()).toBeVisible();
});
