import type { APIRequestContext } from "@playwright/test";

type AvailabilityPayload = { slots?: string[] };

export async function findAvailableSlot(
  request: APIRequestContext,
  service = "tresses",
  startOffsetDays = 20,
) {
  for (let offset = startOffsetDays; offset < startOffsetDays + 90; offset += 1) {
    const candidate = new Date(Date.now() + offset * 86_400_000);
    const date = candidate.toISOString().slice(0, 10);
    const response = await request.get(
      `/api/availability?date=${date}&service=${encodeURIComponent(service)}`,
    );
    if (!response.ok()) continue;
    const payload = (await response.json()) as AvailabilityPayload;
    if (payload.slots?.length) return { date, time: payload.slots[0] };
  }

  throw new Error(`Aucun créneau disponible trouvé pour ${service}`);
}
