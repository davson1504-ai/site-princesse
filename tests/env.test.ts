import { describe, expect, it } from "vitest";
import { readServerEnv } from "@/lib/env";

describe("variables de production", () => {
  it("refuse une production sans base ni secrets admin", () => {
    expect(() => readServerEnv({ NODE_ENV: "production", VERCEL_ENV: "production" })).toThrow(/DATABASE_URL.*AUTH_SECRET.*ADMIN_PASSWORD_HASH/);
  });

  it("accepte les services externes facultatifs non configurés", () => {
    const env = readServerEnv({ NODE_ENV: "production", VERCEL_ENV: "production", DATABASE_URL: "postgresql://user:pass@host/db", AUTH_SECRET: "a-long-production-secret", ADMIN_PASSWORD_HASH: "$2b$12$example" });
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.WHATSAPP_ACCESS_TOKEN).toBeUndefined();
  });
});
