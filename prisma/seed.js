import { PrismaClient } from "@prisma/client";
import lookups from "../mock/lookups.json" with { type: "json" };
import reports from "../mock/reports.json" with { type: "json" };

const prisma = new PrismaClient();

async function main() {
  console.log("[Seed] Memulai seeding data referensi...");

  // 1. Seed Categories (1-8)
  for (const cat of lookups.categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name },
      create: {
        id: cat.id,
        name: cat.name,
      },
    });
  }
  console.log(`[Seed] Berhasil seeding ${lookups.categories.length} kategori.`);

  // 2. Seed Locations (1-9)
  for (const loc of lookups.locations) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: { name: loc.name },
      create: {
        id: loc.id,
        name: loc.name,
      },
    });
  }
  console.log(`[Seed] Berhasil seeding ${lookups.locations.length} lokasi.`);

  // 3. Seed Sample Reports
  for (const r of reports) {
    await prisma.report.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        categoryId: r.category.id,
        locationId: r.location.id,
        locationDetail: r.locationDetail,
        eventDate: new Date(r.eventDate),
        photoUrl: r.photoUrl,
        contactMethod: r.contactMethod,
        contactValue: r.contactValue,
        reporterName: r.reporterName,
        status: r.status,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      },
    });
  }
  console.log(`[Seed] Berhasil seeding ${reports.length} sampel laporan.`);
  console.log("[Seed] Seeding database selesai!");
}

main()
  .catch((e) => {
    console.error("[Seed Error]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
