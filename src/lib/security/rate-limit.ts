import { createHash } from "node:crypto";
import { getPrisma } from "@/lib/database/prisma";

const attempts = new Map<string, { count: number; reset: number }>();
const anonymousKey = (key: string) => createHash("sha256").update(key).digest("hex");

export async function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const hashed = anonymousKey(key);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const db = getPrisma();

  if (db) {
    const rows = await db.$queryRaw<Array<{ count: number }>>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (${hashed}, 1, ${resetAt}, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" < ${now} THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" < ${now} THEN ${resetAt}
          ELSE "RateLimitBucket"."resetAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count"
    `;
    return rows[0].count <= limit;
  }

  const timestamp = Date.now();
  const current = attempts.get(hashed);
  if (!current || current.reset < timestamp) {
    attempts.set(hashed, { count: 1, reset: timestamp + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
