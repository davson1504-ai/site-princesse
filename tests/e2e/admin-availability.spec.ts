import { expect, test } from "@playwright/test";

test("l’administration refuse une date passée et une huitième date publiée", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "La règle serveur est indépendante du navigateur");
  expect((await request.post("/api/admin/login", { data: { password: "princesse-local" } })).status()).toBe(200);
  const existing = (await (await request.get("/api/admin/availability")).json()) as { dates: Array<{ id: string; isPublished: boolean }> };
  for (const row of existing.dates.filter(item => item.isPublished)) await request.patch(`/api/admin/availability/${row.id}`, { data: { isPublished: false } });
  expect((await request.post("/api/admin/availability", { data: { date: "2020-01-02" } })).status()).toBe(409);
  const created: string[] = [];
  for (let offset = 60; created.length < 7; offset += 1) {
    const candidate = new Date(Date.now() + offset * 86_400_000);
    if ([0, 6].includes(candidate.getUTCDay())) continue;
    const response = await request.post("/api/admin/availability", { data: { date: candidate.toISOString().slice(0, 10) } });
    expect(response.status()).toBe(201);
    created.push((await response.json() as { id: string }).id);
  }
  const eighthDate = new Date(Date.now() + 90 * 86_400_000);
  while ([0, 6].includes(eighthDate.getUTCDay())) eighthDate.setUTCDate(eighthDate.getUTCDate() + 1);
  const eighth = await request.post("/api/admin/availability", { data: { date: eighthDate.toISOString().slice(0, 10) } });
  expect(eighth.status()).toBe(409);
  await expect(eighth.json()).resolves.toMatchObject({ error: expect.stringMatching(/Maximum de 7/) });
  for (const id of created) expect((await request.patch(`/api/admin/availability/${id}`, { data: { isPublished: false } })).status()).toBe(200);
});
