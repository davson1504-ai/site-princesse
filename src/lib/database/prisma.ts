import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export function getPrisma() {
  if (process.env.NODE_ENV !== "production" && process.env.LOCAL_JSON_STORAGE === "true") return null;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL est obligatoire en production");
    return null;
  }
  if (!globalForPrisma.prisma) globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  return globalForPrisma.prisma;
}
