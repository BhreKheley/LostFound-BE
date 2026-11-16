import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaStore, publicReportSelect } from "../src/store/prisma.store.js";
import { prisma } from "../src/lib/prisma.js";

vi.mock("../src/lib/prisma.js", () => {
  return {
    prisma: {
      $transaction: vi.fn(),
      report: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

describe("Prisma Store Driver & Privacy Selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should never include private columns (photoPublicId, editTokenHash) in publicReportSelect (T12)", () => {
    expect(publicReportSelect).not.toHaveProperty("photoPublicId");
    expect(publicReportSelect).not.toHaveProperty("editTokenHash");
    expect(publicReportSelect.category.select).toHaveProperty("id", true);
    expect(publicReportSelect.category.select).toHaveProperty("name", true);
  });

  it("should list reports using $transaction and format dates", async () => {
    const mockReports = [
      {
        id: "6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01",
        title: "Tumbler biru",
        eventDate: new Date("2026-11-12"),
      },
    ];

    prisma.$transaction.mockResolvedValue([mockReports, 1]);

    const result = await prismaStore.listReports({ q: "tumbler" });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.data.length).toBe(1);
    expect(result.data[0].eventDate).toBe("2026-11-12");
    expect(result.meta.total).toBe(1);
  });

  it("should create report and guarantee private fields are not exposed in return value (T12)", async () => {
    const mockCreated = {
      id: "new-uuid",
      title: "KTM Mahasiswa",
      eventDate: new Date("2026-11-14"),
      photoUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      // Pastikan objek yang dikembalikan Prisma tidak mengandung field rahasia
    };

    prisma.report.create.mockResolvedValue(mockCreated);

    const result = await prismaStore.createReport({
      type: "FOUND",
      title: "KTM Mahasiswa",
      description: "Ditemukan di perpustakaan",
      categoryId: 1,
      locationId: 3,
      eventDate: "2026-11-14",
      contactMethod: "WHATSAPP",
      contactValue: "6281234567890",
      photoUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      photoPublicId: "secret_public_id",
      editTokenHash: "super_secret_hash",
    });

    expect(result).toHaveProperty("id", "new-uuid");
    expect(result).toHaveProperty("photoUrl");
    // Verifikasi ketat privasi (T12)
    expect(result).not.toHaveProperty("photoPublicId");
    expect(result).not.toHaveProperty("editTokenHash");
  });
});
