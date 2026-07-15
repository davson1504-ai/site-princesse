import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hairstyles, services } from "../src/data/site";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const service of services) await prisma.service.upsert({ where: { slug: service.id }, update: { durationMinutes: service.durationMinutes }, create: { name: service.name, slug: service.id, description: service.description, duration: service.duration, durationMinutes: service.durationMinutes, price: service.price } });
  for (const style of hairstyles) await prisma.hairstyle.upsert({ where: { slug: style.id }, update: {}, create: { name: style.name, slug: style.id, category: style.category, description: "Description à personnaliser", duration: style.duration, mainImage: style.image, galleryImages: [] } });
}

main().finally(() => prisma.$disconnect());
