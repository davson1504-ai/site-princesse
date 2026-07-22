import { test, expect } from "@playwright/test";

test("admin publie une date puis une cliente réserve des tresses", async ({
  page,
}, testInfo) => {
  const offset = testInfo.project.name === "mobile" ? 21 : 14;
  const candidate = new Date(Date.now() + offset * 86400000);
  while ([0, 6].includes(candidate.getUTCDay()))
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  const date = candidate.toISOString().slice(0, 10),
    customer = `Cliente Test ${testInfo.project.name}`;
  await page.goto("/admin");
  await page.getByLabel("Mot de passe administrateur").fill("princesse-local");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/admin?connected=1");
  await page.goto("/admin/disponibilites");
  const counter = page.getByText(/\d \/ 7 dates publiées/);
  if ((await counter.textContent())?.startsWith("7")) {
    const dates = (await (
      await page.request.get("/api/admin/availability")
    ).json()) as { dates: Array<{ id: string; isPublished: boolean }> };
    const active = dates.dates.find((item) => item.isPublished);
    if (active)
      await page.request.patch(`/api/admin/availability/${active.id}`, {
        data: { isPublished: false },
      });
  }
  await page.getByLabel("Date future").fill(date);
  await page
    .getByRole("button", { name: "Publier la date sélectionnée" })
    .click();
  await expect(page.getByText(/\d \/ 7 dates publiées/)).toBeVisible();
  await expect
    .poll(
      async () =>
        (
          (await (await page.request.get("/api/availability")).json()) as {
            dates: string[];
          }
        ).dates,
    )
    .toContain(date);
  const slotResponse = await page.request.get(
    `/api/availability?date=${date}&service=tresses`,
  );
  expect(slotResponse.status()).toBe(200);
  const available = (await slotResponse.json()) as { slots: string[] };
  expect(available.slots.length).toBeGreaterThan(0);
  await page.goto("/rendez-vous");
  await page.getByLabel("Nom complet").fill(customer);
  await page.getByLabel("Téléphone", { exact: true }).fill("+22890000001");
  await page
    .getByLabel("WhatsApp (format international)", { exact: true })
    .fill("+22890000001");
  await page.getByLabel("Service").selectOption("tresses");
  await page.getByLabel("Coiffure").selectOption("box-braids-blondes");
  await page.getByLabel(/M · à partir de/).check();
  await expect(page.getByText(/Estimation : à partir de 70/)).toBeVisible();
  await page.getByLabel(/Longueur supérieure/).check();
  await expect(page.getByText(/Estimation : à partir de 80/)).toBeVisible();
  const publicDateLabel = new Date(`${date}T12:00:00`).toLocaleDateString(
    "fr-FR",
  );
  await page
    .getByRole("button", { name: `${publicDateLabel}, disponible` })
    .click();
  await expect(
    page.getByRole("button", { name: /indisponible|complet/ }).first(),
  ).toBeDisabled();
  const time = page.locator('select[name="appointmentTime"]');
  await expect(time).toBeEnabled({ timeout: 10000 });
  await time.selectOption({ index: 1 });
  await page.getByLabel("Localisation / adresse").fill("Lieu à confirmer");
  await page.getByLabel("Lieu").selectOption("salon");
  await page.getByLabel("Contact préféré").selectOption("whatsapp");
  await page.getByLabel(/politique/).check();
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await page.waitForURL(/\/confirmation\//);
  const reference = new URL(page.url()).pathname.split("/").pop()!;
  await expect(
    page.getByRole("heading", { name: "Demande enregistrée" }),
  ).toBeVisible();
  await page.goto("/admin/rendez-vous");
  const card = page
    .getByRole("article")
    .filter({ hasText: customer })
    .filter({ hasText: date })
    .first();
  await expect(card).toContainText("M");
  await expect(card).toContainText("80");
  await page.goto("/admin/disponibilites");
  const adminDates = (await (
    await page.request.get("/api/admin/availability")
  ).json()) as { dates: Array<{ id: string; date: string }> };
  const target = adminDates.dates.find((item) => item.date.startsWith(date));
  expect(target).toBeTruthy();
  expect(
    (
      await page.request.patch(`/api/admin/availability/${target!.id}`, {
        data: { isPublished: false },
      })
    ).status(),
  ).toBe(200);
  await expect
    .poll(
      async () =>
        (
          (await (await page.request.get("/api/availability")).json()) as {
            dates: string[];
          }
        ).dates,
    )
    .not.toContain(date);
  const appointments = (await (
    await page.request.get("/api/admin/appointments")
  ).json()) as { appointments: Array<{ reference: string }> };
  expect(
    appointments.appointments.some((item) => item.reference === reference),
  ).toBe(true);
  expect(
    (await page.request.delete(`/api/admin/appointments/${reference}`)).status(),
  ).toBe(200);
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await page.waitForURL("**/admin");
  const refused = await page.request.post("/api/appointments", {
    headers: { "x-forwarded-for": `e2e-grey-${testInfo.project.name}` },
    data: {
      customerName: "Refus Date Grise",
      phone: "+22890000002",
      whatsapp: "+22890000002",
      serviceId: "tresses",
      hairstyleId: "box-braids-blondes",
      braidSizeCode: "M",
      extraLength: false,
      estimatedPriceCents: 7000,
      appointmentDate: date,
      appointmentTime: "09:00",
      location: "Lieu à confirmer",
      appointmentType: "salon",
      preferredContactMethod: "whatsapp",
      privacy: true,
    },
  });
  expect(refused.status()).toBe(409);
});
