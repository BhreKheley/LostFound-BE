import { describe, it, expect, beforeEach } from "vitest";
import { memoryStore } from "../src/store/memory.store.js";

describe("In-Memory Store Driver", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("should return seeded reports with correct pagination metadata", async () => {
    const result = await memoryStore.listReports({ page: 1, limit: 12 });
    expect(result.data.length).toBe(6);
    expect(result.meta.total).toBe(6);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(12);
    expect(result.meta.totalPages).toBe(1);
  });

  it("should support case-insensitive title search (q)", async () => {
    const result = await memoryStore.listReports({ q: "TUMBLER" });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].title.toLowerCase()).toContain("tumbler");
  });

  it("should filter reports by type ('LOST' or 'FOUND')", async () => {
    const losts = await memoryStore.listReports({ type: "LOST" });
    expect(losts.data.every((r) => r.type === "LOST")).toBe(true);

    const founds = await memoryStore.listReports({ type: "FOUND" });
    expect(founds.data.every((r) => r.type === "FOUND")).toBe(true);
  });

  it("should combine multiple filters with AND logic", async () => {
    // LOST + categoryId 4 (Botol minum)
    const result = await memoryStore.listReports({
      type: "LOST",
      categoryId: 4,
    });
    expect(result.data.length).toBe(1);
    expect(result.data[0].title).toContain("Tumbler");
  });

  it("should paginate correctly with custom page and limit", async () => {
    const page1 = await memoryStore.listReports({ page: 1, limit: 2 });
    expect(page1.data.length).toBe(2);
    expect(page1.meta.totalPages).toBe(3);

    const page2 = await memoryStore.listReports({ page: 2, limit: 2 });
    expect(page2.data.length).toBe(2);
    expect(page2.data[0].id).not.toBe(page1.data[0].id);
  });

  it("should find report by ID or return null if not found", async () => {
    const existing = await memoryStore.getReportById("6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01");
    expect(existing).not.toBeNull();
    expect(existing?.title).toContain("Tumbler");

    const nonExistent = await memoryStore.getReportById("00000000-0000-0000-0000-000000000000");
    expect(nonExistent).toBeNull();
  });

  it("should create new report and prepend it as the newest item", async () => {
    const newReport = await memoryStore.createReport({
      type: "LOST",
      title: "Earphone TWS Hitam",
      description: "Earphone tertinggal di lobi utama depan pos satpam.",
      categoryId: 2,
      locationId: 6,
      eventDate: "2026-11-15",
      contactMethod: "WHATSAPP",
      contactValue: "6281234567890",
      reporterName: "Bhre",
    });

    expect(newReport.id).toBeDefined();
    expect(newReport.category.name).toBe("Elektronik dan charger");
    expect(newReport.location.name).toBe("Lobi utama");
    expect(newReport.status).toBe("ACTIVE");

    const list = await memoryStore.listReports();
    expect(list.meta.total).toBe(7);
    expect(list.data[0].id).toBe(newReport.id);
  });
});
