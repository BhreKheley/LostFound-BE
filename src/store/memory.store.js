import crypto from "crypto";
import mockReports from "../../mock/reports.json" with { type: "json" };
import { CATEGORIES, LOCATIONS } from "../validators/report.schema.js";

export class MemoryStore {
  constructor(initialData = mockReports) {
    this.initialData = initialData;
    this.reports = JSON.parse(JSON.stringify(initialData));
  }

  reset() {
    this.reports = JSON.parse(JSON.stringify(this.initialData));
  }

  async listReports(query = {}) {
    const { q, type, categoryId, locationId, page = 1, limit = 12 } = query;

    let filtered = [...this.reports];

    // 1. Search `q` pada title (case-insensitive substring)
    if (q && q.trim() !== "") {
      const keyword = q.trim().toLowerCase();
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(keyword));
    }

    // 2. Filter type ('LOST' | 'FOUND')
    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }

    // 3. Filter categoryId (integer)
    if (categoryId !== undefined && categoryId !== null) {
      const catId = Number(categoryId);
      filtered = filtered.filter((r) => r.category.id === catId);
    }

    // 4. Filter locationId (integer)
    if (locationId !== undefined && locationId !== null) {
      const locId = Number(locationId);
      filtered = filtered.filter((r) => r.location.id === locId);
    }

    // 5. Urutkan berdasarkan createdAt menurun (terbaru lebih dulu)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 6. Paginasi
    const total = filtered.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const totalPages = Math.ceil(total / limitNum) || 0;
    const offset = (pageNum - 1) * limitNum;
    const data = filtered.slice(offset, offset + limitNum);

    return {
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  async getReportById(id) {
    const report = this.reports.find((r) => r.id === id);
    return report || null;
  }

  async createReport(input) {
    const categoryObj = CATEGORIES.find((c) => c.id === Number(input.categoryId));
    const locationObj = LOCATIONS.find((l) => l.id === Number(input.locationId));

    const now = new Date().toISOString();
    const newReport = {
      id: crypto.randomUUID(),
      type: input.type,
      title: input.title,
      description: input.description,
      category: categoryObj || { id: Number(input.categoryId), name: "Kategori Lain" },
      location: locationObj || { id: Number(input.locationId), name: "Lokasi Lain" },
      locationDetail: input.locationDetail || null,
      eventDate: input.eventDate,
      photoUrl: input.photoUrl || null,
      contactMethod: input.contactMethod,
      contactValue: input.contactValue,
      reporterName: input.reporterName || null,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    // Tambahkan di awal array (terbaru)
    this.reports.unshift(newReport);

    return newReport;
  }
}

export const memoryStore = new MemoryStore();
