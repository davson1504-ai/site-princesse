import { getPrisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const db = getPrisma();
    if (!db) return Response.json({ application: "ok", database: "local-development" });
    await db.$queryRaw`SELECT 1`;
    return Response.json({ application: "ok", database: "ok" });
  } catch {
    return Response.json({ application: "ok", database: "unavailable" }, { status: 503 });
  }
}
