import { getPrisma } from "@/lib/database/prisma";
import { isAdmin } from "@/lib/security/auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const db = getPrisma();
    if (!db) return Response.json({ database: "local-development" });
    await db.$queryRaw`SELECT 1`;
    return Response.json({ database: "ok" });
  } catch {
    return Response.json({ database: "unavailable" }, { status: 503 });
  }
}
