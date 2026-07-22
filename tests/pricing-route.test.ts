import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/database/prisma", () => ({ getPrisma: () => ({ serviceVariant: { findMany } }) }));

import { GET } from "@/app/api/pricing/route";

describe("API tarifs", () => {
  beforeEach(() => findMany.mockReset());

  it("ne propose que les variantes actives", async () => {
    findMany.mockResolvedValue([{ code: "M", priceCents: 7000, extraLengthCents: 1000, active: true, displayOrder: 2 }]);
    const response = await GET();
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { active: true } }));
    await expect(response.json()).resolves.toEqual({ variants: [{ code: "M", priceCents: 7000, extraLengthCents: 1000, active: true, displayOrder: 2 }] });
  });
});
